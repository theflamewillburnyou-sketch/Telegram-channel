const DEFAULT_COOLDOWN_MS =
  5 * 60 * 1000;


const providerState = {};


function ensureProvider(name) {

  if (!providerState[name]) {
    providerState[name] = {
      status: "AVAILABLE",
      cooldownUntil: 0,
      lastErrorType: null,
      failureCount: 0
    };
  }

  return providerState[name];
}


function isProviderAvailable(name) {

  const state =
    ensureProvider(name);

  if (
    state.status === "COOLDOWN" &&
    Date.now() >= state.cooldownUntil
  ) {
    state.status = "AVAILABLE";
    state.cooldownUntil = 0;
    state.lastErrorType = null;
  }

  return state.status === "AVAILABLE";
}


function markProviderSuccess(name) {

  const state =
    ensureProvider(name);

  state.status = "AVAILABLE";
  state.cooldownUntil = 0;
  state.lastErrorType = null;
  state.failureCount = 0;
}


function markProviderCooldown(
  name,
  options = {}
) {

  const state =
    ensureProvider(name);

  const cooldownMs =
    options.cooldownMs ||
    DEFAULT_COOLDOWN_MS;

  state.status = "COOLDOWN";
  state.cooldownUntil =
    Date.now() + cooldownMs;
  state.lastErrorType =
    options.errorType || null;
  state.failureCount += 1;

  return state;
}


function getProviderState(name) {
  return {
    ...ensureProvider(name)
  };
}


function resetProviderState() {

  for (const key of Object.keys(providerState)) {
    delete providerState[key];
  }
}


module.exports = {
  DEFAULT_COOLDOWN_MS,
  isProviderAvailable,
  markProviderSuccess,
  markProviderCooldown,
  getProviderState,
  resetProviderState
};
