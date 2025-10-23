document.getElementById('solve-btn').addEventListener('click', () => {
    const inputs = [
        document.getElementById('num1').value,
        document.getElementById('num2').value,
        document.getElementById('num3').value,
        document.getElementById('num4').value
    ];

    const numbers = inputs.map(Number).filter(n => n > 0);
    const resultContainer = document.getElementById('result-container');
    const resultEl = document.getElementById('result');

    if (numbers.length !== 4) {
        resultEl.innerText = 'กรุณาป้อนตัวเลขให้ครบ 4 ตัว';
        resultContainer.classList.remove('hidden');
        return;
    }

    const solution = find24(numbers);
    
    if (solution.solution) {
        resultEl.innerText = `${solution.solution} = 24`;
    } else {
        resultEl.innerText = `ไม่สามารถสร้าง 24 ได้\nคำตอบที่ใกล้ที่สุดคือ:\n${solution.closestEq} = ${solution.closestVal}`;
    }
    resultContainer.classList.remove('hidden');
});

function find24(numbers) {
    const ops = ['+', '-', '*', '/'];
    let solutions = [];
    let closest = { val: Infinity, eq: '' };

    function getPermutations(arr) {
        if (arr.length === 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = getPermutations(remaining);
            for (let p of perms) {
                result.push([current, ...p]);
            }
        }
        return result;
    }

    const numPerms = getPermutations(numbers);

    for (const p of numPerms) {
        for (const op1 of ops) {
            for (const op2 of ops) {
                for (const op3 of ops) {
                    // Pattern: (a op b) op (c op d)
                    evaluate(`${p[0]} ${op1} ${p[1]}`, `${p[2]} ${op3} ${p[3]}`, op2);
                    // Pattern: ((a op b) op c) op d
                    evaluate(`(${p[0]} ${op1} ${p[1]}) ${op2} ${p[2]}`, `${p[3]}`, op3);
                }
            }
        }
    }

    function evaluate(expr1, expr2, op) {
        try {
            const val1 = eval(expr1);
            const val2 = eval(expr2);
            if (op === '/' && val2 === 0) return;

            const finalExpr = `(${expr1}) ${op} (${expr2})`;
            const finalVal = eval(finalExpr);

            if (finalVal === 24) {
                solutions.push(finalExpr.replace(/\s/g, ''));
            } else {
                if (Math.abs(finalVal - 24) < Math.abs(closest.val - 24)) {
                    closest = { val: finalVal, eq: finalExpr.replace(/\s/g, '') };
                }
            }
        } catch (e) {}
    }

    if (solutions.length > 0) {
        return { solution: solutions[0] };
    }
    return { solution: null, closestVal: closest.val, closestEq: closest.eq };
}

