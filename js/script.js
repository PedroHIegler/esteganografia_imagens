document.addEventListener("DOMContentLoaded", function() {
    const imageInput = document.getElementById("imageInput");
    const messageInput = document.getElementById("messageInput");
    const encodeButton = document.getElementById("encodeButton");
    const decodeButton = document.getElementById("decodeButton");
    const hiddenMessage = document.getElementById("hiddenMessage");
  
    let originalImage = null;
    let hasHiddenMessage = false;
  
    imageInput.addEventListener("change", function(event) {
      messageInput.style.display = "block";
      encodeButton.style.display = "block";
      decodeButton.style.display = "block";
      hiddenMessage.textContent = " ";
      const file = event.target.files[0];
      originalImage = URL.createObjectURL(file);
  
      const displayedImage = document.getElementById("displayedImage");
      displayedImage.style.display = "block";
      displayedImage.src = originalImage;
    });
  
  
  
    encodeButton.addEventListener("click", function() {
      if (!originalImage || !messageInput.value) {
        alert("Selecione uma imagem e digite uma mensagem primeiro.");
        return;
      }
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const message = messageInput.value;
        const messageT = message + ":divisor:";
        hideMessageInImageData(imageData, messageT);
  
        ctx.putImageData(imageData, 0, 0);
        const encodedImageData = canvas.toDataURL("image/png");
        alert("Mensagem escondida na imagem!");
  
        const a = document.createElement("a");
        a.href = encodedImageData;
        a.download = "encoded_image.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = originalImage;
    });
  
    decodeButton.addEventListener("click", function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decodedMessage = extractMessageFromImageData(imageData);
        const decodesMessageFinal = decodedMessage.split(":divisor:");
        hiddenMessage.textContent = "Mensagem: " + decodesMessageFinal[0];
      };
      img.src = originalImage;
    });
  
    function hideMessageInImageData(imageData, message) {
      const binaryMessage = textToBinary(message);
      let messageIndex = 0;
  
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (messageIndex < binaryMessage.length) {
          imageData.data[i] = modifyByte(imageData.data[i], binaryMessage.charAt(messageIndex));
          messageIndex++;
        } else {
          break;
        }
      }
    }
  
    function extractMessageFromImageData(imageData) {
      let binaryMessage = "";
      let charBuffer = "";
    
      for (let i = 0; i < imageData.data.length; i += 4) {
        const bit = extractBit(imageData.data[i]);
        charBuffer += bit;
    
        if (charBuffer.length === 8) {
          const charCode = parseInt(charBuffer, 2);
          if (charCode === 0) {
            break; 
          }
          binaryMessage += String.fromCharCode(charCode);
          charBuffer = "";
        }
      }
    
      return binaryMessage;
    }
  
    function modifyByte(byte, bit) {
      if (bit === "1") {
        return byte | 1;
      } else {
        return byte & 0xFE; //x1F
      }
    }
  
    function extractBit(byte) {
      return byte & 1;
    }
  
    function textToBinary(text) {
      let binary = "";
      for (let i = 0; i < text.length; i++) {
        binary += text[i].charCodeAt(0).toString(2).padStart(8, "0");
      }
      return binary;
    }

  });
  
  