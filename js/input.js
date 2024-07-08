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

function send_form(){
  //alert("helo3");
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.studiodesignapp.com/api/v2/projects/Kwa531JrOX/form");
  xhr.setRequestHeader("Content-Type", "application/json");
  const body = '{"form_name":"インフルエンサー登録フォーム","data":[["お名前","大久保テストjs text送信","TEXT"],["メールアドレス","okubo@logly.co.jp","EMAIL"],["ご住所","千葉県浦安市","TEXT"],["ご年齢","45","TEXT"],["電話番号","0803087190","TEL"],["LINEID","helloworld","TEL"],["TikTokプロフィール名","","TEXT"],["YouTubeURL","","TEXT"],["InstagramURL","","TEXT"],["X URL","","TEXT"],["Confirm","on","CHECKBOX"]],"is_preview":false}';
  // const body = JSON.stringify({
  //   title: "Hello World",
  //   body: "My POST request",
  //   userId: 900,
  // });
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
};

