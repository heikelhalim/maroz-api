var customValidator = {
    checkFileExtension: function(value, filename, extension) {
        var path = require('path')
        var ext = (path.extname(filename)).toLowerCase();
        return extension.includes(ext);
    },
    checkFileSize: function(value, filesize, size) {
        return filesize <= size;
    },
    checkFileExist: function(value, filePath) {
        const fs = require('fs');
        return fs.existsSync(filePath);
    }
};

//module.exports = customValidator;
export default customValidator;