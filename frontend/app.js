// app.js - shared helpers for frontend pages
const API_BASE = "https://dmdecode-worker.onrender.com"; // change if backend hosted elsewhere

function setToken(token){
  localStorage.setItem("dd_token", token);
}

function getToken(){
  return localStorage.getItem("dd_token");
}

function clearToken(){
  localStorage.removeItem("dd_token");
}

// decode JWT payload (no validation) to extract user id
function decodeJwt(token){
  if(!token) return null;
  try{
    const parts = token.split(".");
    if(parts.length<2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  }catch(e){ return null; }
}

async function apiFetch(path, opts = {}){
  const url = API_BASE + path;
  const headers = opts.headers || {};
  const token = getToken();
  if(token) headers["Authorization"] = "Bearer " + token;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  try{
    const res = await fetch(url, {...opts, headers});
    const text = await res.text();
    // try parse
    let data;
    try{ data = text ? JSON.parse(text) : null } catch(e){ data = { raw: text } }
    if(!res.ok) throw { status: res.status, data };
    return data;
  }catch(e){
    throw e;
  }
}
