'use strict';

const APP_PATH = `/auth0-static`;
let auth0 = null;
const fetchAuthConfig = () => fetch("auth_config.json");

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

  //document.getElementById("btn-logout").disabled = !isAuthenticated;
  //document.getElementById("btn-login").disabled = isAuthenticated;
  
  // NEW - add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("img-login").style.display = "none";
    document.getElementById("btn-logout").style.display = "block";

    document.getElementById("gated-content").classList.remove("hidden");

    // document.getElementById(
    //   "ipt-access-token"
    // ).innerHTML = await auth0.getTokenSilently();
    var user = await auth0.getUser();

    document.getElementById("ipt-user-profile").innerHTML = JSON.stringify(
      await auth0.getUser()
    );
    document.getElementById("ipt-user-profile").innerHTML = user["name"];

    //プロフ画像
    //const profile = await auth0.getUser();
    //document.getElementById("ipt-user-profile-image").src = profile.picture;

  } else {
    document.getElementById("img-login").style.display = "block";
    document.getElementById("btn-logout").style.display = "none";
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
