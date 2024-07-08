'use strict';

const APP_PATH = `/auth0-static`;
let auth0 = null;
const fetchAuthConfig = () => fetch("js/auth_config.json");

const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};

window.onload = async () => {
  await configureClient();

  updateUI();

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    // show the gated content
    return;
  }

  // NEW - check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0.handleRedirectCallback();
    
    updateUI();

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, APP_PATH);
  }
};

const updateUI = async () => { 
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    document.getElementById("login").style.display = "none";
    document.getElementById("logout").style.display = "block";

    document.getElementById("gated-content").classList.remove("hidden");

    const profile = await auth0.getUser();
    document.getElementById("line_id").value = profile.sub.replace("line|","");
    document.getElementById("line_info").value = JSON.stringify(profile);
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("logout").style.display = "none";
    document.getElementById("gated-content").classList.add("hidden");
  }
};

const login = async () => {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin + APP_PATH
  });
};

const logout = () => {
  auth0.logout({
    returnTo: window.location.origin + APP_PATH
  });
};

function valid(){
  let isValid = true;
    
  const requiredFields = { "fullname":"ご本名", "email":"メールアドレス", "address":"ご住所", "age":"ご年齢", "phone":"電話番号 ", "confirm":"個人向け取引基本規約に同意する" };
  for (let key in requiredFields) {
      const input = document.getElementById(key);
      if(key == "confirm"){
        if (input.checked == false) {
            isValid = false;
        }
      } else {
        if (input.value.trim() === '') {
            isValid = false;
        }
      }

      if ( isValid == false ){
        alert(`${requiredFields[key]} は必須です。`);
          input.focus();
          return false;
      }
  };
  return true;
};

function send_form(){
  if (valid() == false ){ return false;}
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.studiodesignapp.com/api/v2/projects/Kwa531JrOX/form");
  xhr.setRequestHeader("Content-Type", "application/json");

  let data = [];
  data.push(["お名前", document.getElementById("fullname").value, "TEXT"]);
  data.push(["メールアドレス", document.getElementById("email").value, "EMAIL"]);
  data.push(["ご住所", document.getElementById("address").value, "TEXT"]);
  data.push(["ご年齢", document.getElementById("age").value, "TEXT"]);
  data.push(["電話番号", document.getElementById("phone").value, "TEL"]);
  data.push(["LINEID", document.getElementById("line_id").value, "TEXT"]);
  data.push(["TikTokプロフィール名", document.getElementById("tiktok").value, "TEXT"]);
  data.push(["YouTubeURL", document.getElementById("youtube").value, "TEXT"]);
  data.push(["InstagramURL", document.getElementById("instagram").value, "TEXT"]);
  data.push(["X URL", document.getElementById("twitter").value, "TEXT"]);
  data.push(["Confirm", "on", "CHECKBOX"]);
  const body = JSON.stringify({"form_name":"インフルエンサー登録フォーム","data":data,"is_preview":false});

  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      console.log(JSON.parse(xhr.responseText));
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send(body);

  document.getElementById("gated-content").style.display = "none";
  document.getElementById("thanks").style.display = "block";
  document.getElementById("logout").style.display = "none";

  location.hash='pagetop';
};

