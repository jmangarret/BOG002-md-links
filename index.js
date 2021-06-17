// module.exports = () => {
//   // ...
// };

const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var http = require('http');
var https = require('https');
const { resolve } = require('path');

// Enviar Parámetros desde la terminal (Node)
const param1 = process.argv[0]; // PARA CAPTURAR NODE
const param2 = process.argv[1]; // PARA CAPTURAR LA RUTA ABSOLUTA DEL ARCHIVO QUE SE EJECUTA
let param3 = process.argv[2]; // PARA 1ER PARAMETRO
let param4 = process.argv[3]; // PARA 2DO PARAMETRO

// Convirtiendo una ruta relativa a ruta absoluta
if (path.isAbsolute(param3) === false) {
  param3 = path.resolve(param3)
}

// Verificando si es un file o un directorio
let arraydir = [];

function GetFiles(param3) {
  statsDirectory = fs.lstatSync(param3).isDirectory();
  if (statsDirectory) {
    const directory = fs.readdirSync(param3)
    for (let index in directory) {
      let nextDirectory = path.join(param3, directory[index]);
      if (path.extname(directory[index]) === ".md") {
        arraydir.push(param3 + "\\" + directory[index]);
      }
      if (fs.lstatSync(nextDirectory).isDirectory()) {
        GetFiles(nextDirectory)
      }
    }
    return arraydir;
  }
  if (path.extname(param3) === ".md") {
    arraydir.push(param3);
    return arraydir;
  }
}

const arraydir2 = GetFiles(param3)
// console.log("soy directorio final", arraydir2)

// Para leer el contenido del archivo recibido mediante la ruta
function readFileContent(arraydir) {
  const md = new MarkdownIt();
  let result;
  const dataLinks = [];
  arraydir.forEach(file => {
    const data = fs.readFileSync(file, { encoding: 'utf8' })
    result = md.render(data);
    const dom = new JSDOM(result);
    let Nodelinks = dom.window.document.querySelectorAll("a");
    Nodelinks.forEach((link) => {
      if (link.href.startsWith("http")) {
        dataLinks.push({
          href: link.href,
          text: link.textContent,
          file: file,
        })
        // return dataLinks
      }
    })
  });
  return dataLinks;
}

const fileContent = readFileContent(arraydir2)
// console.log("soy lectura de archivo", fileContent)

function validateStatusLinks(fileContent) {
  const newArrObj = [];
  fileContent.forEach((link) => {
    if (link.href.startsWith('https')) {
      const httpsGet = new Promise(function(resolver, rechazar){
        https.get(link.href, function (res) {
          const newObj = {
            href: link.href,
            text: link.text,
            file: link.file,
            status: res.statusCode,
            ok: res.statusMessage,
          }
          res.on('error', function (e) {
            console.error(e);
          });
          // console.log(newObj)
          resolver (newObj);
        })
      });
      newArrObj.push(httpsGet)
    }
  });
  return Promise.all(newArrObj);
  
}

validateStatusLinks(fileContent).then((resul) => {
  console.log(resul)
})


