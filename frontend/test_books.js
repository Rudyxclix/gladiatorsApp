import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'treasurer@gladiators.com',
      password: 'password123'
    });
    const token = res.data.token;
    console.log("Token:", token.substring(0, 10) + '...');
    const progs = await axios.get('http://localhost:5001/api/programs', { headers: { Authorization: `Bearer ${token}` }});
    console.log("Programs Data Is Array:", Array.isArray(progs.data));
    const pId = progs.data[0]._id;
    const booksRes = await axios.get(`http://localhost:5001/api/books/inventory/${pId}?page=1&limit=5`, { headers: { Authorization: `Bearer ${token}` }});
    console.log("Books Keys:", Object.keys(booksRes.data));
    console.log("Books Array length:", booksRes.data.books?.length);
  } catch(e) { console.error("Error:", e.response?.data || e.message); }
}
test();
