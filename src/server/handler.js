const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData'); 

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;
    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      "id": id,
      "result": label,
      "explanation": explanation,
      "suggestion": suggestion,
      "confidenceScore": confidenceScore,
      "createdAt": createdAt
    }

    // Menyimpan data ke Firestore menggunakan storeData dengan koleksi 'machine-cancer'
    await storeData(id, data); 

    const response = h.response({
      status: 'success',
      message: confidenceScore > 99 ? 'Model is predicted successfully.' : 'Model is predicted successfully but under threshold. Please use the correct picture',
      data
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('An error occurred while processing prediction:', error);
    // Menangani kesalahan dan memberikan respons yang sesuai
    const response = h.response({
      status: 'error',
      message: 'An error occurred while processing the prediction.'
    });
    response.code(500);
    return response;
  }
}

module.exports = postPredictHandler;
