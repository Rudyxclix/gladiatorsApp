import axios from 'axios';
async function login() {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'treasurer@gladiators.com',
      password: 'password123'
    });
    console.log(res.data.token);
  } catch(e) { console.error(e.response?.data || e.message); }
}
login();
