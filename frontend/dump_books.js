import axios from 'axios';
import fs from 'fs';
async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'treasurer@gladiators.com',
      password: 'password123'
    });
    const token = res.data.token;
    const progs = await axios.get('http://localhost:5001/api/programs', { headers: { Authorization: `Bearer ${token}` }});
    const pId = progs.data[0]._id;
    const booksRes = await axios.get(`http://localhost:5001/api/books/inventory/${pId}?page=1&limit=5`, { headers: { Authorization: `Bearer ${token}` }});
    fs.writeFileSync('books_dump.json', JSON.stringify(booksRes.data, null, 2));
    console.log("Wrote " + booksRes.data.books?.length + " books to dump file");
  } catch(e) { console.error("Error:", e.response?.data || e.message); }
}
test();
