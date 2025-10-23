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
    
    if (solution.found) {
        resultEl.innerText = `${solution.equation} = 24`;
    } else {
        // ตรวจสอบว่ามีคำตอบใกล้เคียงที่เป็นจำนวนเต็มหรือไม่
        if (solution.closestVal === Infinity) {
             resultEl.innerText = `ไม่สามารถสร้าง 24 หรือจำนวนเต็มใกล้เคียงได้`;
        } else {
             resultEl.innerText = `ไม่สามารถสร้าง 24 ได้\nคำตอบ (จำนวนเต็ม) ที่ใกล้ที่สุดคือ:\n${solution.closestEq} = ${solution.closestVal}`;
        }
    }
    resultContainer.classList.remove('hidden');
});

function find24(numbers) {
    const initialItems = numbers.map(n => ({ value: n, str: `${n}` }));
    let solutions = [];
    let closest = { val: Infinity, eq: '' };

    function solve(items) {
        if (items.length === 1) {
            const item = items[0];
            const finalValue = item.value;

            // **เงื่อนไขใหม่: ตรวจสอบ 24 โดยเผื่อค่า погрешность ของ float**
            if (Math.abs(finalValue - 24) < 0.00001) {
                solutions.push(item.str);
            } 
            // **เงื่อนไขใหม่: คำตอบใกล้เคียงต้องเป็นจำนวนเต็มเท่านั้น**
            else if (finalValue % 1 === 0) { // ตรวจสอบว่าเป็นจำนวนเต็มหรือไม่
                if (Math.abs(finalValue - 24) < Math.abs(closest.val - 24)) {
                    closest = { val: finalValue, eq: item.str };
                }
            }
            return;
        }

        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i];
                const b = items[j];
                const remaining = items.filter((_, index) => index !== i && index !== j);

                const operators = ['+', '-', '*', '/'];
                for (const op of operators) {
                    calculate(a, b, op, remaining);
                    if (op === '-' || op === '/') {
                        calculate(b, a, op, remaining);
                    }
                }
            }
        }
    }
    
    function calculate(item1, item2, op, remaining) {
        let newValue, newStr;

        switch (op) {
            case '+':
                newValue = item1.value + item2.value;
                newStr = `${item1.str}+${item2.str}`;
                break;
            case '-':
                if (item1.value < item2.value) return; 
                newValue = item1.value - item2.value;
                newStr = `${item1.str}-${item2.str}`;
                break;
            case '*':
                newValue = item1.value * item2.value;
                newStr = `${addParen(item1, '*')}*${addParen(item2, '*')}`;
                break;
            case '/':
                // **เงื่อนไขใหม่: อนุญาตให้หารไม่ลงตัวได้ แต่ห้ามหารด้วย 0**
                if (item2.value === 0) return;
                newValue = item1.value / item2.value;
                newStr = `${addParen(item1, '/')} / ${addParen(item2, '/')}`;
                break;
        }
        
        solve([...remaining, { value: newValue, str: newStr }]);
    }

    function addParen(item, operator) {
        if (operator === '*' || operator === '/') {
            if (item.str.includes('+') || item.str.includes('-')) {
                return `(${item.str})`;
            }
        }
        return item.str;
    }

    solve(initialItems);

    if (solutions.length > 0) {
        const uniqueSolutions = [...new Set(solutions)];
        return { found: true, equation: uniqueSolutions[0] };
    }
    
    return { found: false, closestVal: closest.val, closestEq: closest.eq };
}
