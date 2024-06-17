export function parseFormatNumber(input: string): number {
    // 定义正则表达式匹配不同的格式
    const regex = /^(\d+(\.\d+)?)([KkWw万]?)\+?$/;

    const match = input.match(regex);
    if (!match) {
        throw new Error(`Invalid input format: ${input}`);
    }

    let [, numberStr, , unit] = match;
    let number = parseFloat(numberStr);

    switch (unit) {
        case 'K':
        case 'k':
            number *= 1000;
            break;
        case 'W':
        case 'w':
        case '万':
            number *= 10000;
            break;
        default:
            break;
    }

    return number;
}
