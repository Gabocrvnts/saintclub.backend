const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
 accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

app.post('/crear-pago', async (req, res) => {
  const { items, buyer } = req.body;
  try {
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          quantity: item.qty,
          unit_price: item.price,
          currency_id: 'MXN'
        })),
        payer: { name: buyer.name, email: buyer.email },
        back_urls: {
          success: 'https://effervescent-boba-e66649.netlify.app',
          failure: 'https://effervescent-boba-e66649.netlify.app',
          pending: 'https://effervescent-boba-e66649.netlify.app'
        },
        statement_descriptor: 'SAINT CLUB'
      }
    });
    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error MercadoPago COMPLETO:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Error al crear el pago',
      detalle: error.message || 'sin mensaje',
      causa: error.cause || null,
      apiResponse: error.apiResponse || null
    });
  }
});

app.get('/', (req, res) => res.send('Saint Club Backend activo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
