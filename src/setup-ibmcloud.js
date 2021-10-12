const os = require("os");
const path = require("path");
const toolCache = require("@actions/tool-cache");
const core = require("@actions/core");

const version = core.getInput("version") || "latest";

console.log("version", version);

function resolveDownloadURL() {
  const osName = os.platform().toLowerCase();
  const osArch = os.arch().toLowerCase();
  let platform = "";

  if (osName === "linux") {
    if (osArch === "x64" || osArch === "x86_64") {
      platform = "amd64";
    } else if (osArch === "x86" || osArch === "i686") {
      platform = "386";
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

  const downloadUrl = `https://download.clis.cloud.ibm.com/ibm-cloud-cli/${version}/IBM_Cloud_CLI_${version}_${osName}_${platform}.tgz`;

  console.info("CLI download url", downloadUrl);

  return downloadUrl;

  //https://download.clis.cloud.ibm.com/ibm-cloud-cli/2.1.1/binaries/IBM_Cloud_CLI_2.1.1_linux_amd64.tgz
}

async function downloadAndExtract() {
  //const downloadURL = resolveDownloadURL();
  const downloadUrl = "https://clis.cloud.ibm.com/install/linux";

  console.info(`Downloading CLI tools from ${downloadURL}...`);

  const downloadPath = await toolCache.downloadTool(downloadURL);
  const extractedPath = await toolCache.extractTar(downloadPath);

  return extractedPath;
}

async function installTool(extractedPath) {
  const toolRoot = path.join(extractedPath, "ibmcloud_cli", "bin");
  const toolPath = await toolCache.cacheDir(toolRoot, "ibmcloud", version);
  return toolPath;
}

module.exports.run = async function () {
  try {
    let toolPath = toolCache.find("ibmcloud", version);
    if (!toolPath) {
      console.info("Tool was not already installed.");
      const extractedPath = await downloadAndExtract();
      console.log({ extractedPath });
      console.info(`Installing tool from path ${extractedPath}...`);
      toolPath = await installTool(extractedPath);
    }

    console.info("toolPath", toolPath);

    core.addPath(toolPath);
  } catch (error) {
    console.error(error);
  }
};
