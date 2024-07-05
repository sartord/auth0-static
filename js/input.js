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
