// ============================ NODE & AVL TREE ============================

class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
        this.rotationCallback = null;
    }

    // ==================== UTILITY FUNCTIONS ====================
    height(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    minValueNode(node) {
        let current = node;
        while (current.left) current = current.left;
        return current;
    }

    // ==================== ROTATIONS ====================
    async rightRotate(y) {
        if (this.rotationCallback) await this.rotationCallback('right', y, y.left);

        let x = y.left;
        let T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = 1 + Math.max(this.height(y.left), this.height(y.right));
        x.height = 1 + Math.max(this.height(x.left), this.height(x.right));

        return x;
    }

    async leftRotate(x) {
        if (this.rotationCallback) await this.rotationCallback('left', x, x.right);

        let y = x.right;
        let T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = 1 + Math.max(this.height(x.left), this.height(x.right));
        y.height = 1 + Math.max(this.height(y.left), this.height(y.right));

        return y;
    }

    // ==================== INSERTION ====================
    async insert(node, value) {
        if (!node) return new Node(value);

        if (value < node.value) node.left = await this.insert(node.left, value);
        else if (value > node.value) node.right = await this.insert(node.right, value);
        else return node; // duplicate

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        let balance = this.getBalance(node);

        // Handle unbalanced cases
        if (Math.abs(balance) > 1) {
            updateStatus(`🚨 CRITICAL: Node ${node.value} is UNBALANCED with Balance Factor = ${balance}`);
            highlightUnbalanced(node.value);
            highlightInsertingNode(value);
            await sleep(2000);

            // Left-Left Case
            if (balance > 1 && value < node.left.value) {
                updateStatus(`📊 ANALYSIS: Left-Left case`);
                await sleep(2000);
                updateStatus(`🔧 SOLUTION: Single RIGHT rotation needed`);
                await sleep(1500);
                return await this.rightRotate(node);
            }

            // Right-Right Case
            if (balance < -1 && value > node.right.value) {
                updateStatus(`📊 ANALYSIS: Right-Right case`);
                await sleep(2000);
                updateStatus(`🔧 SOLUTION: Single LEFT rotation needed`);
                await sleep(1500);
                return await this.leftRotate(node);
            }

            // Left-Right Case
            if (balance > 1 && value > node.left.value) {
                updateStatus(`📊 ANALYSIS: Left-Right case`);
                await sleep(2000);
                updateStatus(`🔧 SOLUTION: Double rotation needed`);
                await sleep(1500);
                node.left = await this.leftRotate(node.left);
                return await this.rightRotate(node);
            }

            // Right-Left Case
            if (balance < -1 && value < node.right.value) {
                updateStatus(`📊 ANALYSIS: Right-Left case`);
                await sleep(2000);
                updateStatus(`🔧 SOLUTION: Double rotation needed`);
                await sleep(1500);
                node.right = await this.rightRotate(node.right);
                return await this.leftRotate(node);
            }
        }

        return node;
    }

    // ==================== DELETION ====================
    async delete(node, value) {
        if (!node) return node;

        if (value < node.value) node.left = await this.delete(node.left, value);
        else if (value > node.value) node.right = await this.delete(node.right, value);
        else {
            if (!node.left || !node.right) node = node.left ? node.left : node.right;
            else {
                let temp = this.minValueNode(node.right);
                node.value = temp.value;
                node.right = await this.delete(node.right, temp.value);
            }
        }

        if (!node) return node;

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        let balance = this.getBalance(node);

        if (Math.abs(balance) > 1) {
            updateStatus(`🚨 Tree unbalanced at node ${node.value} (BF: ${balance})`);
            highlightUnbalanced(node.value);
            await sleep(1000);
        }

        // Right or Left rotation cases
        if (balance > 1 && this.getBalance(node.left) >= 0) return await this.rightRotate(node);
        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = await this.leftRotate(node.left);
            return await this.rightRotate(node);
        }
        if (balance < -1 && this.getBalance(node.right) <= 0) return await this.leftRotate(node);
        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = await this.rightRotate(node.right);
            return await this.leftRotate(node);
        }

        return node;
    }
}

// ============================ GLOBAL VARIABLES ============================
const tree = new AVLTree();
const container = document.getElementById('tree-container');

let animationSpeed = 1.0;
let isPaused = false;
let animationQueue = [];
let currentStep = 0;

// ============================ SPEED CONTROL ============================
document.getElementById('speedSlider').addEventListener('input', function (e) {
    animationSpeed = parseFloat(e.target.value);
    document.getElementById('speedDisplay').textContent = animationSpeed.toFixed(1) + 'x';
});

// ============================ SLEEP FUNCTION ============================
async function sleep(ms) {
    const adjustedTime = ms / animationSpeed;
    const startTime = Date.now();
    while (Date.now() - startTime < adjustedTime) {
        if (isPaused) {
            await new Promise(resolve => {
                const checkPause = () => (!isPaused ? resolve() : setTimeout(checkPause, 100));
                checkPause();
            });
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// ============================ ROTATION CALLBACK ============================
tree.rotationCallback = async (direction, oldRoot, newRoot) => {
    await sleep(500);

    updateStatus(`🔍 STEP 1: Identified unbalanced node ${oldRoot.value} needs ${direction.toUpperCase()} rotation`);
    highlightCritical(oldRoot.value);
    await sleep(2000);

    updateStatus(`🎯 STEP 2: Node ${newRoot.value} will become the new root (rotation pivot)`);
    highlightRotationPivot(newRoot.value);
    await sleep(2000);

    // STEP 3: Moving Subtree
    let movingSubtree = null;
    if (direction === 'right' && newRoot.right) {
        movingSubtree = newRoot.right.value;
        updateStatus(`📦 STEP 3: Subtree T2 (${movingSubtree}) moves`);
        highlightSubtree(movingSubtree);
    } else if (direction === 'left' && newRoot.left) {
        movingSubtree = newRoot.left.value;
        updateStatus(`📦 STEP 3: Subtree T2 (${movingSubtree}) moves`);
        highlightSubtree(movingSubtree);
    } else {
        updateStatus(`📦 STEP 3: No subtree T2 to move`);
    }
    await sleep(2500);

    updateStatus(`⬇️ STEP 4: Node ${oldRoot.value} moves down`);
    highlightMoving(oldRoot.value);
    await sleep(2000);

    updateStatus(`⚡ STEP 5: Executing ${direction.toUpperCase()} rotation...`);
    await sleep(1000);
    drawTree();
    await sleep(1500);

    updateStatus(`✅ STEP 6: Rotation complete! Node ${newRoot.value} is now root`);
    highlightBalanced(newRoot.value);
    clearAllHighlights();
    await sleep(2000);
};

// ============================ STATUS BAR ============================
function updateStatus(msg) {
    document.getElementById("status-bar").innerHTML = msg;
}

// ============================ HIGHLIGHT FUNCTIONS ============================
function highlightNode(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 1200);
}

function highlightCritical(value) {
    clearAllHighlights();
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("critical");
}

function highlightUnbalanced(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("unbalanced");
}

function highlightRotationPivot(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("rotation-pivot");
}

function highlightMoving(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("moving");
}

function highlightSubtree(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("subtree-node");
}

function highlightBalanced(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    clearAllHighlights();
    el.classList.add("balanced");
    setTimeout(() => el.classList.remove("balanced"), 2000);
}

function clearAllHighlights() {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => node.classList.remove(
        "critical", "unbalanced", "rotation-pivot", "moving", "subtree-node"
    ));
}

function highlightEdge(parentVal, childVal) {
    const el = document.getElementById(`edge-${parentVal}-${childVal}`);
    if (!el) return;
    el.classList.add("edge-active");
    setTimeout(() => el.classList.remove("edge-active"), 500);
}

function highlightInsertingNode(value) {
    const el = document.getElementById(`node-${value}`);
    if (!el) return;
    el.classList.add("inserting");
    setTimeout(() => el.classList.remove("inserting"), 2000);
}

// ============================ TREE OPERATIONS ============================
async function insertNodeAnimated() {
    const value = parseInt(document.getElementById('value').value);
    if (isNaN(value)) return;

    clearAllHighlights();
    isPaused = false;
    currentStep = 0;
    animationQueue = [];

    updateStatus(`🔍 PHASE 1: Searching for insertion position for ${value}...`);
    await sleep(1000);

    let current = tree.root;
    let depth = 0;

    while (current) {
        depth++;
        highlightNode(current.value);

        if (value === current.value) {
            updateStatus(`❌ Value ${value} already exists in the tree!`);
            return;
        }

        const comparison = value < current.value ? "less than" : "greater than";
        const direction = value < current.value ? "left" : "right";
        updateStatus(`📍 Level ${depth}: ${value} is ${comparison} ${current.value} → go ${direction}`);
        await sleep(1500);

        if (value < current.value && current.left) highlightEdge(current.value, current.left.value);
        else if (value >= current.value && current.right) highlightEdge(current.value, current.right.value);
        await sleep(800);

        current = value < current.value ? current.left : current.right;
    }

    updateStatus(`✅ PHASE 2: Found insertion position for ${value} at depth ${depth + 1}`);
    await sleep(1500);

    updateStatus(`🔧 PHASE 3: Inserting ${value} and checking balance...`);
    tree.root = await tree.insert(tree.root, value);
    drawTree();
    updateTraversals();
    await sleep(1000);

    updateStatus(`🎉 Successfully inserted ${value}! Tree height updated and balanced.`);
    clearAllHighlights();
}

async function deleteNodeAnimated() {
    const value = parseInt(document.getElementById('value').value);
    if (isNaN(value)) return;

    updateStatus(`🗑️ Deleting ${value}...`);
    highlightNode(value);
    await sleep(800);

    tree.root = await tree.delete(tree.root, value);
    drawTree();
    updateTraversals();
    updateStatus(`✅ Successfully deleted ${value}!`);
}

function resetTree() {
    tree.root = null;
    drawTree();
    updateTraversals();
    updateStatus("🔄 Tree reset - ready for new operations!");
}

// ============================ TREE TRAVERSALS ============================
function inorder(node, result = []) {
    if (node) {
        inorder(node.left, result);
        result.push(node.value);
        inorder(node.right, result);
    }
    return result;
}

function preorder(node, result = []) {
    if (node) {
        result.push(node.value);
        preorder(node.left, result);
        preorder(node.right, result);
    }
    return result;
}

function postorder(node, result = []) {
    if (node) {
        postorder(node.left, result);
        postorder(node.right, result);
        result.push(node.value);
    }
    return result;
}

function updateTraversals() {
    document.getElementById('inorder-result').textContent = tree.root ? inorder(tree.root).join(' → ') : 'Empty';
    document.getElementById('preorder-result').textContent = tree.root ? preorder(tree.root).join(' → ') : 'Empty';
    document.getElementById('postorder-result').textContent = tree.root ? postorder(tree.root).join(' → ') : 'Empty';
}

// ============================ DRAW TREE ============================
function drawTree() {
    const svg = document.getElementById("edges-svg");
    svg.innerHTML = '';
    container.querySelectorAll('.node').forEach(n => n.remove());
    if (!tree.root) return;

    const levelGap = 80;

    function traverse(node, x, y, gap) {
        if (!node) return;

        if (node.left) {
            drawLine(x, y, x - gap, y + levelGap, node.value, node.left.value);
            traverse(node.left, x - gap, y + levelGap, gap / 1.5);
        }
        if (node.right) {
            drawLine(x, y, x + gap, y + levelGap, node.value, node.right.value);
            traverse(node.right, x + gap, y + levelGap, gap / 1.5);
        }

        drawNode(node.value, x, y, node);
    }

    traverse(tree.root, container.offsetWidth / 2, 80, 200);
}

function drawNode(value, x, y, nodeRef) {
    let node = document.getElementById(`node-${value}`);
    if (!node) {
        node = document.createElement('div');
        node.className = 'node';
        node.id = `node-${value}`;

        const val = document.createElement('div');
        val.textContent = value;
        val.style.fontWeight = 'bold';
        val.style.fontSize = '16px';

        const bf = document.createElement('span');
        bf.className = 'balance-factor';
        bf.textContent = `BF:${tree.getBalance(nodeRef)}`;

        node.appendChild(val);
        node.appendChild(bf);
        container.appendChild(node);
    }
    node.style.left = (x - 35) + 'px';
    node.style.top = (y - 35) + 'px';
    node.querySelector('.balance-factor').textContent = `BF:${tree.getBalance(nodeRef)}`;
}

function drawLine(x1, y1, x2, y2, parentVal, childVal) {
    const svg = document.getElementById("edges-svg");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "rgba(255,255,255,0.6)");
    line.setAttribute("stroke-width", 3);
    line.id = `edge-${parentVal}-${childVal}`;
    svg.appendChild(line);
}

// ============================ BUILD TREE FROM TRAVERSALS ============================
function buildFromTraversals() {
    const inorderInput = document.getElementById("inorder-seq").value.trim();
    const prepostInput = document.getElementById("prepost-seq").value.trim();
    const type = document.getElementById("traversal-type").value;

    if (!inorderInput || !prepostInput) {
        updateStatus("⚠️ Please enter both inorder and preorder/postorder sequences");
        return;
    }

    const inorder_seq = inorderInput.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    const seq = prepostInput.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));

    if (!inorder_seq.length || !seq.length || inorder_seq.length !== seq.length) {
        updateStatus("❌ Invalid sequences (length mismatch or invalid numbers)");
        return;
    }

    tree.root = type === "pre" ? buildTreeFromPreIn(seq, inorder_seq) : buildTreeFromPostIn(seq, inorder_seq);
    drawTree();
    updateTraversals();
    updateStatus(`✅ Tree built from Inorder + ${type === "pre" ? "Preorder" : "Postorder"}!`);
}

function buildTreeFromPreIn(preorder, inorder) {
    if (!preorder.length || !inorder.length) return null;
    const rootVal = preorder[0];
    const root = new Node(rootVal);
    const mid = inorder.indexOf(rootVal);
    root.left = buildTreeFromPreIn(preorder.slice(1, mid + 1), inorder.slice(0, mid));
    root.right = buildTreeFromPreIn(preorder.slice(mid + 1), inorder.slice(mid + 1));
    return root;
}

function buildTreeFromPostIn(postorder, inorder) {
    if (!postorder.length || !inorder.length) return null;
    const rootVal = postorder[postorder.length - 1];
    const root = new Node(rootVal);
    const mid = inorder.indexOf(rootVal);
    root.left = buildTreeFromPostIn(postorder.slice(0, mid), inorder.slice(0, mid));
    root.right = buildTreeFromPostIn(postorder.slice(mid, postorder.length - 1), inorder.slice(mid + 1));
    return root;
}

// ============================ SEARCH ============================
function clearSearchHighlights() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove("search-path", "search-found"));
}

function highlightSearchPath(value) {
    const el = document.getElementById(`node-${value}`);
    if (el) el.classList.add("search-path");
}

function highlightFoundNode(value) {
    const el = document.getElementById(`node-${value}`);
    if (el) el.classList.add("search-found");
}

async function searchNodeAnimated() {
    const value = parseInt(document.getElementById('value').value);
    if (isNaN(value)) return;

    clearSearchHighlights();
    updateStatus(`🔍 Starting search for ${value}...`);
    await sleep(1000);

    let current = tree.root;
    let depth = 0;

    while (current) {
        depth++;
        highlightSearchPath(current.value);

        if (value === current.value) {
            updateStatus(`✅ Found ${value} at depth ${depth}!`);
            highlightFoundNode(current.value);
            return;
        }

        const direction = value < current.value ? "left" : "right";
        updateStatus(`➡️ ${value} is ${direction === "left" ? "less" : "greater"} than ${current.value}, going ${direction}...`);
        await sleep(1500);

        if (direction === "left" && current.left) highlightEdge(current.value, current.left.value);
        else if (direction === "right" && current.right) highlightEdge(current.value, current.right.value);
        await sleep(800);

        current = value < current.value ? current.left : current.right;
    }

    updateStatus(`❌ ${value} not found in the tree.`);
}
