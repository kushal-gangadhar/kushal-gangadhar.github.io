// Fetch last update date from GitHub API
        async function fetchLastUpdate() {
            try {
                // Replace 'kushal-gangadhar' and 'kushal-gangadhar.github.io' with actual username/repo if different
                const response = await fetch('https://api.github.com/repos/kushal-gangadhar/kushal-gangadhar.github.io/commits?per_page=1');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data && data.length > 0) {
                    const commitDate = new Date(data[0].commit.committer.date);
                    const options = { year: 'numeric', month: 'long' };
                    document.getElementById('last-updated').textContent = `| Last updated: ${commitDate.toLocaleDateString('en-US', options)}`;
                }
            } catch (error) {
                console.error('Error fetching last update:', error);
                document.getElementById('last-updated').style.display = 'none';
            }
        }
        fetchLastUpdate();

        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // --- Background 3D Animation ---
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');

        let dots = [];
        const dotSpacing = 60; // Increased slightly for better balance
        const jitterAmount = 6;
        let cols = 0, rows = 0;
        let pathWalkers = [];
        let spawnTimer = 0;

        class Dot {
            constructor(x, y, color) {
                this.baseX = x; this.baseY = y; this.color = color;
                this.x = x; this.y = y; this.radius = 2;
                this.targetX = x; this.targetY = y; this.timer = 0;
            }
            update() {
                this.timer--;
                if (this.timer <= 0) {
                    this.targetX = this.baseX + (Math.random() - 0.5) * jitterAmount * 5;
                    this.targetY = this.baseY + (Math.random() - 0.5) * jitterAmount * 5;
                    this.timer = 30 + Math.random() * 80;
                }
                this.x += (this.targetX - this.x) * 0.02;
                this.y += (this.targetY - this.y) * 0.02;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color; ctx.fill();
            }
        }

        class PathWalker {
            constructor(gridX, gridY, stepsTaken = 0) {
                this.gridX = gridX; this.gridY = gridY;
                this.startX = gridX * dotSpacing; this.startY = gridY * dotSpacing;
                this.targetX = this.startX; this.targetY = this.startY;
                this.stepsTaken = stepsTaken;
                this.progress = 1;
                this.speed = 0.015 + Math.random() * 0.01;
                this.alpha = 0; this.targetAlpha = 0.7; // Increased visibility
                this.dead = false;
            }
            update() {
                if (this.alpha < this.targetAlpha) this.alpha += 0.02;
                if (this.progress < 1) {
                    this.progress += this.speed;
                    if (this.progress >= 1) {
                        this.progress = 1;
                        this.startX = this.targetX; this.startY = this.targetY;
                        this.stepsTaken++;
                        if (this.stepsTaken % 5 === 0) this.split();
                        else this.setNextTarget();
                    }
                } else {
                    this.setNextTarget();
                }
                if (this.dead) this.alpha -= 0.02;
            }
            setNextTarget() {
                const canMoveLeft = this.gridX > 0;
                const canMoveDown = this.gridY < rows - 1;
                if (!canMoveLeft && !canMoveDown) { this.dead = true; return; }
                if (canMoveLeft && canMoveDown) {
                    if (Math.random() > 0.5) this.gridX--; else this.gridY++;
                } else if (canMoveLeft) this.gridX--; else this.gridY++;
                this.targetX = this.gridX * dotSpacing;
                this.targetY = this.gridY * dotSpacing;
                this.progress = 0;
            }
            split() {
                const canMoveLeft = this.gridX > 0;
                const canMoveDown = this.gridY < rows - 1;
                if (canMoveLeft && canMoveDown) {
                    this.gridX--; this.targetX = this.gridX * dotSpacing; this.targetY = this.gridY * dotSpacing;
                    this.progress = 0;
                    const sibling = new PathWalker(this.gridX + 1, this.gridY, this.stepsTaken);
                    sibling.gridY++; sibling.targetX = sibling.gridX * dotSpacing;
                    sibling.targetY = sibling.gridY * dotSpacing; sibling.progress = 0;
                    pathWalkers.push(sibling);
                } else {
                    this.setNextTarget();
                }
            }
            draw() {
                const x = this.startX + (this.targetX - this.startX) * this.progress;
                const y = this.startY + (this.targetY - this.startY) * this.progress;
                
                // Draw current edge segment (Faint & Subtle)
                ctx.beginPath();
                ctx.moveTo(this.startX, this.startY);
                ctx.lineTo(x, y);
                
                // Create a very subtle gradient-like stroke
                ctx.strokeStyle = `rgba(163, 213, 255, ${this.alpha * 0.4})`;
                ctx.lineWidth = 1.8;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        // Morphing Polyhedron Class
        class MorphingPolyhedron {
            constructor() {
                this.baseSize = 160;
                this.size = this.baseSize;
                this.angleX = 0; this.angleY = 0;
                this.rotationCount = 0;
                this.phase = 'rotating';
                this.hovered = false;
                
                const phi = (1 + Math.sqrt(5)) / 2;
                const invPhi = 1 / phi;

                this.shapes = [
                    // Octahedron
                    { nodes: [[0,-1.2,0], [0,1.2,0], [1,0,0], [0,0,1], [-1,0,0], [0,0,-1]],
                      edges: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[3,4],[4,5],[5,2]],
                      color: [177, 156, 217] },
                    // Cube
                    { nodes: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
                      edges: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],
                      color: [163, 213, 255] },
                    // Tetrahedron
                    { nodes: [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],
                      edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],
                      color: [244, 114, 182] },
                    // Dodecahedron (20 nodes)
                    { nodes: [
                        [1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1],
                        [0,invPhi,phi],[0,invPhi,-phi],[0,-invPhi,phi],[0,-invPhi,-phi],
                        [invPhi,phi,0],[invPhi,-phi,0],[-invPhi,phi,0],[-invPhi,-phi,0],
                        [phi,0,invPhi],[phi,0,-invPhi],[-phi,0,invPhi],[-phi,0,-invPhi]
                      ].map(n => n.map(v => v * 0.85)),
                      edges: [], // Edges auto-calculated below for brevity
                      color: [190, 242, 100] },
                    // Icosahedron (12 nodes)
                    { nodes: [
                        [0,1,phi],[0,1,-phi],[0,-1,phi],[0,-1,-phi],
                        [1,phi,0],[1,-phi,0],[-1,phi,0],[-1,-phi,0],
                        [phi,0,1],[phi,0,-1],[-phi,0,1],[-phi,0,-1]
                      ].map(n => n.map(v => v * 1.1)),
                      edges: [],
                      color: [163, 213, 255] }
                ];

                // Auto-generate edges for Dodecahedron and Icosahedron based on proximity
                for (let sIdx = 3; sIdx < 5; sIdx++) {
                    const s = this.shapes[sIdx];
                    for (let i = 0; i < s.nodes.length; i++) {
                        for (let j = i + 1; j < s.nodes.length; j++) {
                            const dx = s.nodes[i][0] - s.nodes[j][0];
                            const dy = s.nodes[i][1] - s.nodes[j][1];
                            const dz = s.nodes[i][2] - s.nodes[j][2];
                            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                            // Dodecahedron edges ~1.24, Icosahedron ~1.05 (normalized)
                            if (dist < 1.3) s.edges.push([i, j]);
                        }
                    }
                }

                this.currentShapeIdx = 0;
                this.targetShapeIdx = 1;
                this.t = 0; 
            }

            rotate(ax, ay) {
                this.angleX += ax; 
                this.angleY += ay;
                this.rotationCount += (Math.abs(ax) + Math.abs(ay));
                
                if (this.phase === 'rotating' && this.rotationCount > 10) { // More rotations before morph
                    this.phase = 'collapsing';
                    this.t = 0;
                }
            }

            update() {
                const speed = 0.008; // Much slower transition
                const offsetX = canvas.width * 0.85;
                const offsetY = canvas.height * 0.8;
                
                if (this.phase === 'collapsing') {
                    this.t += speed;
                    const ease = this.t < 0.5 ? 4 * this.t * this.t * this.t : 1 - Math.pow(-2 * this.t + 2, 3) / 2;
                    this.size = this.baseSize * (1 - ease);
                    if (this.t >= 1) {
                        this.t = 0; this.size = 0;
                        this.currentShapeIdx = this.targetShapeIdx;
                        this.targetShapeIdx = (this.targetShapeIdx + 1) % this.shapes.length;
                        this.phase = 'expanding';
                    }
                } else if (this.phase === 'expanding') {
                    this.t += speed;
                    const ease = this.t < 0.5 ? 4 * this.t * this.t * this.t : 1 - Math.pow(-2 * this.t + 2, 3) / 2;
                    this.size = this.baseSize * ease;
                    if (this.t >= 1) {
                        this.t = 0; this.size = this.baseSize;
                        this.phase = 'rotating'; this.rotationCount = 0;
                    }
                }
            }

            draw() {
                const shape = this.shapes[this.currentShapeIdx];
                const nextShape = this.shapes[this.targetShapeIdx];
                const offsetX = canvas.width * 0.85;
                const offsetY = canvas.height * 0.8;
                const c1 = shape.color, c2 = nextShape.color;
                const r = Math.round(c1[0] + (c2[0] - c1[0]) * this.t);
                const g = Math.round(c1[1] + (c2[1] - c1[1]) * this.t);
                const b = Math.round(c1[2] + (c2[2] - c1[2]) * this.t);

                const projected = shape.nodes.map(node => {
                    let x = node[0] * this.size, y = node[1] * this.size, z = node[2] * this.size;
                    let cY = Math.cos(this.angleY), sY = Math.sin(this.angleY);
                    let tx = x * cY - z * sY, tz = x * sY + z * cY;
                    x = tx; z = tz;
                    let cX = Math.cos(this.angleX), sX = Math.sin(this.angleX);
                    let ty = y * cX - z * sX; tz = y * sX + z * cX;
                    y = ty; z = tz;
                    const scale = 700 / (700 + z);
                    return [x * scale + offsetX, y * scale + offsetY];
                });

                ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
                shape.edges.forEach(e => {
                    ctx.moveTo(projected[e[0]][0], projected[e[0]][1]);
                    ctx.lineTo(projected[e[1]][0], projected[e[1]][1]);
                });
                ctx.stroke();
            }
        }

        class D20 {
            constructor() {
                this.size = 160; this.angleX = 0; this.angleY = 0;
                const phi = (1 + Math.sqrt(5)) / 2;
                this.nodes = [
                    [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
                    [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
                    [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]
                ].map(n => {
                    const len = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]);
                    return [n[0]/len, n[1]/len, n[2]/len];
                });
                this.edges = [];
                for(let i=0; i<12; i++) {
                    for(let j=i+1; j<12; j++) {
                        const d = Math.hypot(this.nodes[i][0]-this.nodes[j][0], this.nodes[i][1]-this.nodes[j][1], this.nodes[i][2]-this.nodes[j][2]);
                        if (d < 1.1) this.edges.push([i, j]);
                    }
                }
            }
            rotate(ax, ay) { this.angleX += ax; this.angleY += ay; }
            draw() {
                const offsetX = 140, offsetY = 140;
                const projected = this.nodes.map(node => {
                    let x = node[0] * this.size, y = node[1] * this.size, z = node[2] * this.size;
                    let cY = Math.cos(this.angleY), sY = Math.sin(this.angleY);
                    let tx = x * cY - z * sY, tz = x * sY + z * cY;
                    x = tx; z = tz;
                    let cX = Math.cos(this.angleX), sX = Math.sin(this.angleX);
                    let ty = y * cX - z * sX; ty = y * sX + z * cX;
                    y = ty; z = tz;
                    const scale = 700 / (700 + z);
                    return [x * scale + offsetX, y * scale + offsetY];
                });
                ctx.beginPath(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(190, 242, 100, 0.7)';
                this.edges.forEach(e => {
                    ctx.moveTo(projected[e[0]][0], projected[e[0]][1]);
                    ctx.lineTo(projected[e[1]][0], projected[e[1]][1]);
                });
                ctx.stroke();
            }
        }

        const morpher = new MorphingPolyhedron();
        const d20 = new D20();

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cols = Math.ceil(canvas.width / dotSpacing) + 1;
            rows = Math.ceil(canvas.height / dotSpacing) + 1;
            dots = [];
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    // Only generate a dot on ~30% of the vertices for a cleaner look
                    if (Math.random() < 0.3) {
                        const x = i * dotSpacing, y = j * dotSpacing;
                        const cIdx = (i + j) % 3;
                        const colors = ['rgba(177,156,217,0.4)','rgba(244,114,182,0.4)','rgba(163,213,255,0.4)'];
                        dots.push(new Dot(x, y, colors[cIdx]));
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dots.forEach(dot => { dot.update(); dot.draw(); });
            ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,0.015)';
            for(let x=0; x<canvas.width; x+=dotSpacing) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
            for(let y=0; y<canvas.height; y+=dotSpacing) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
            ctx.stroke();

            // Path Walkers Wave
            spawnTimer--;
            if (spawnTimer <= 0) {
                pathWalkers.push(new PathWalker(cols - 1, 0));
                spawnTimer = 240; // Spawn every 4 seconds approx
            }
            pathWalkers = pathWalkers.filter(p => !p.dead || p.alpha > 0);
            pathWalkers.forEach(p => { p.update(); p.draw(); });

            morpher.rotate(-0.0024, 0.0012);
            morpher.update();
            morpher.draw();
            d20.rotate(-0.001, 0.001);
            d20.draw();
            requestAnimationFrame(animate);
        }

        // --- Interaction Logic ---
        function copyEmail(e) {
            e.preventDefault();
            const email = "kushalgangadhariah@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                const toast = document.getElementById('toast');
                toast.innerHTML = '<strong>Email Copied!</strong>' + email;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            });
        }

        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
        }, observerOptions);
        document.querySelectorAll('section').forEach(section => observer.observe(section));

        window.addEventListener('resize', resize);
        resize();
        animate();