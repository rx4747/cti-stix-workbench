const uriPattern = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/iu;
const email =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/iu;
const asciiHostname =
  /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/iu;

function idnHostname(value) {
  try {
    const hostname = new URL(`http://${value}`).hostname;
    return hostname.replace(/\.$/u, "").length <= 253 && asciiHostname.test(hostname);
  } catch {
    return false;
  }
}

function uri(value) {
  return uriPattern.test(value);
}

export default Object.freeze({
  email,
  "idn-hostname": idnHostname,
  uri,
});
