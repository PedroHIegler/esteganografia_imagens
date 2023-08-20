document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput');
  const messageInput = document.getElementById('messageInput');
  const hideButton = document.getElementById('hideButton');
  const extractButton = document.getElementById('extractButton');
  const downloadLink = document.getElementById('downloadLink');
  const feedback = document.getElementById('feedback');
  const imageDisplay = document.getElementById('imageDisplay');

  hideButton.addEventListener('click', async () => {
      const message = messageInput.value;
      if (!message) {
          alert('Por favor, digite uma mensagem para ocultar.');
          return;
      }

      const imageFile = imageInput.files[0];
      if (!imageFile) {
          alert('Por favor, selecione uma imagem.');
          return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
          const imageData = new Uint8Array(event.target.result);
          const encodedImageData = await encodeMessage(imageData, message);
          const encodedBlob = new Blob([encodedImageData], { type: 'image/jpeg' });
          const encodedImageURL = URL.createObjectURL(encodedBlob);

          const img = new Image();
          img.src = encodedImageURL;
          feedback.innerHTML = 'Mensagem ocultada com sucesso na imagem.';

          downloadLink.href = encodedImageURL;
          downloadLink.download = 'imagem_esteganografada.jpg';
          downloadLink.style.display = 'block';
      };
      reader.readAsArrayBuffer(imageFile);
  });

  extractButton.addEventListener('click', async () => {
      const imageFile = imageInput.files[0];
      if (!imageFile) {
          alert('Por favor, selecione uma imagem para extrair a mensagem.');
          return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
          const imageData = new Uint8Array(event.target.result);
          const extractedMessage = await extractMessage(imageData);
          if (extractedMessage) {
              feedback.innerHTML = `Mensagem extraída: ${extractedMessage}`;
          } else {
              feedback.innerHTML = 'Nenhuma mensagem encontrada na imagem.';
          }
      };
      reader.readAsArrayBuffer(imageFile);
  });

  imageInput.addEventListener('change', () => {
      const imageFile = imageInput.files[0];
      if (!imageFile) {
          extractButton.style.display = 'none';
          imageDisplay.style.display = 'none';
          return;
      }

      imageDisplay.src = URL.createObjectURL(imageFile);
      imageDisplay.style.display = 'block';

      checkForMessage(imageFile).then(containsMessage => {
          if (containsMessage) {
              feedback.innerHTML = 'Esta imagem contém uma mensagem oculta.';
              extractButton.style.display = 'block';
          } else {
              feedback.innerHTML = 'Esta imagem não contém uma mensagem oculta.';
              extractButton.style.display = 'none';
          }
      });
  });

  async function encodeMessage(imageData, message) {
      // Adicione o tamanho da mensagem como um marcador no início
      const sizeMarker = new Uint8Array(4);
      sizeMarker[0] = (message.length >> 24) & 0xFF;
      sizeMarker[1] = (message.length >> 16) & 0xFF;
      sizeMarker[2] = (message.length >> 8) & 0xFF;
      sizeMarker[3] = message.length & 0xFF;

      const messageBytes = new TextEncoder().encode(message);
      const encodedImageData = new Uint8Array(imageData);

      let byteIndex = 0;
      // Inclua o tamanho da mensagem como parte dos bytes codificados
      for (let i = 0; i < 4; i++) {
          for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
              const bit = (sizeMarker[i] >> bitIndex) & 1;
              encodedImageData[byteIndex] = (encodedImageData[byteIndex] & 0xFE) | bit;
              byteIndex++;
          }
      }

      for (let i = 0; i < messageBytes.length; i++) {
          for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
              const bit = (messageBytes[i] >> bitIndex) & 1;
              encodedImageData[byteIndex] = (encodedImageData[byteIndex] & 0xFE) | bit;
              byteIndex++;
          }
      }

      return encodedImageData;
  }

  async function checkForMessage(imageFile) {
      return new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = async (event) => {
              const imageData = new Uint8Array(event.target.result);
              const extractedMessage = await extractMessage(imageData);
              resolve(extractedMessage !== null && extractedMessage.length > 0);
          };
          reader.readAsArrayBuffer(imageFile);
      });
  }

  async function extractMessage(imageData) {
      const extractedBytes = new Uint8Array(imageData.length / 8);

      let byteIndex = 0;
      for (let i = 0; i < imageData.length; i += 8) {
          let byte = 0;
          for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
              byte = (byte << 1) | (imageData[i + bitIndex] & 1);
          }
          extractedBytes[byteIndex] = byte;
          byteIndex++;
      }

      const sizeMarker = extractedBytes.subarray(0, 4);
      const messageSize = (sizeMarker[0] << 24) | (sizeMarker[1] << 16) | (sizeMarker[2] << 8) | sizeMarker[3];

      const extractedMessageBytes = extractedBytes.subarray(4, 4 + messageSize);
      const extractedMessage = new TextDecoder().decode(extractedMessageBytes);
      return extractedMessage;
  }
});
