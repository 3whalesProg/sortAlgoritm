const fs = require('fs');
const inputFile = 'input.txt'; 
const outputFile = 'output.txt'; 

function lineSorter(string, charlist){ //сортирует строчку в алфавитном порядке
    for (let i = 0; i < string.length; i++){ //проходимся по каждой строчку
        if (!Object.hasOwn(charlist, string[i])){ //проверям есть ли буква в нашем листе. Если нет - добавляем
            Object.keys(charlist).sort()
            charlist[string[i]] = 1
        }
        else{ //если есть - записываем туда значение += 1
            charlist[string[i]] += 1
        }
    }
    charlist = Object.fromEntries(Object.entries(charlist).sort((a,b) => a[0].localeCompare(b[0]))) //сортировка в алфовитном порядке
    delete charlist['\n']
    delete charlist['\r'] 
    return charlist
}

async function chankCreator(startPosition){ //будем ассинхронно читать файл чанками
    return new Promise((resolve, reject) => {
        let data = ''
        let isLineEnd = false
        const chankSize = 500; //возьмем условный чанк в 500 символов 
        fs.open(inputFile, 'r', (err, fd) => {
            if (err) {
                reject(err);
                return;
            }
            fs.readSync(fd, Buffer.alloc(startPosition), 0, startPosition, null); //делаем отступ
            const buffer = Buffer.alloc(1);
            let bytesRead = 0;
            while (bytesRead < chankSize) {
                fs.readSync(fd, buffer, 0, 1, null);
                
                if (buffer.toString() === '\n' || buffer.toString() === '\r\n') {
                    bytesRead += 2
                    isLineEnd = true //открыли файл и начали читать до момента пока не наберем 500 символов или до конца строки
                    break;
                }
                data += buffer.toString();
                bytesRead++;
            }
            resolve({data, isLineEnd, bytesRead}) //возвращаем чанк из 500 символов 
        });
    })
}

function fileWriter(charlist){
    const file = fs.createWriteStream(outputFile, {flags: 'a'});
    for (let i =0; i < Object.keys(charlist).length;i++){
        let dataString = Object.keys(charlist)[i].repeat(Object.values(charlist)[i])
        file.write(dataString)
    }
    file.write('\n')
    file.end();
}

async function main(){
    let num = 0
    for (let i = 0; i < 4; i ++){
        let gav = true
        let charlist = {}
        while (gav){
            let chankedString = await chankCreator(num).then((result) => {
                if (result){
                    gav = !result.isLineEnd
                    num += result.bytesRead
                    return result.data
                }
            })
            charlist = lineSorter(chankedString, charlist)
        }  
        fileWriter(charlist)
    }  
}

main()