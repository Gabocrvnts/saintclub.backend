const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Si tu página en Netlify quedó con otro nombre, cámbialo SOLO aquí:
const FRONTEND_URL = 'https://saintclub.netlify.app';

const client = new MercadoPagoConfig({
 accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

app.post('/crear-pago', async (req, res) => {
  const { items, buyer } = req.body;
  try {
    // Guarda el pedido en los logs de Railway como respaldo
    console.log('NUEVO PEDIDO:', JSON.stringify({ buyer, items }));

    const datosEnvio = [
      buyer.name, buyer.phone || 'sin tel', buyer.city || '', buyer.address || ''
    ].join(' | ').slice(0, 250);

    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          quantity: item.qty,
          unit_price: item.price,
          currency_id: 'MXN'
        })),
        payer: {
          name: buyer.name,
          email: buyer.email,
          phone: { number: buyer.phone || '' },
          address: { street_name: (buyer.address || '') + ', ' + (buyer.city || '') }
        },
        metadata: {
          envio_nombre: buyer.name,
          envio_telefono: buyer.phone || '',
          envio_ciudad: buyer.city || '',
          envio_direccion: buyer.address || ''
        },
        external_reference: datosEnvio,
        back_urls: {
          success: FRONTEND_URL,
          failure: FRONTEND_URL,
          pending: FRONTEND_URL
        },
        auto_return: 'approved',
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
