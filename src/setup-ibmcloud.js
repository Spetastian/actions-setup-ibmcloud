const os = require("os");
const path = require("path");
const toolCache = require("@actions/tool-cache");
const core = require("@actions/core");

const repoHost = "clis.cloud.ibm.com";

function resolveDownloadURL() {
  const osName = os.platform().toLowerCase();
  const osArch = os.arch().toLowerCase();
  let platform = "";

  if (osName === "linux") {
    if (osArch === "x64" || osArch === "x86_64") {
      platform = "linux64";
    } else if (osArch === "x86" || osArch === "i686") {
      platform = "linux32";
    } else if (osArch === "ppc64le") {
      platform = "ppc64le";
    } else if (osArch === "s390x") {
      platform = "s390x";
    } else {
      throw new Error(`Platform architecture ${osArch} not supported`);
    }
  } else {
    throw new Error(`Platform ${osName} not supported`);
  }

  return `https://${repoHost}/download/bluemix-cli/latest/${platform}`;
}

async function downloadAndExtract() {
  const downloadURL = resolveDownloadURL();
  console.info(`Downloading CLI tools from ${downloadURL}...`);

  const downloadPath = await toolCache.downloadTool(downloadURL);
  const extractedPath = await toolCache.extractTar(downloadPath);

  return extractedPath;
}

async function installTool(extractedPath) {
  const toolRoot = path.join(extractedPath, "Bluemix_CLI", "bin");
  const toolPath = await toolCache.cacheDir(toolRoot, "ibmcloud", "latest");
  return toolPath;
}

module.exports.run = async function () {
  try {
    let toolPath = toolCache.find("ibmcloud", "latest");
    if (!toolPath) {
      console.info("Tool was not already installed.");
      const extractedPath = await downloadAndExtract();
      console.log({ extractedPath });
      console.info(`Installing tool from path ${extractedPath}...`);
      toolPath = await installTool(extractedPath);
    }

    core.addPath(toolPath);
  } catch (error) {
    console.error(error);
  }
};
