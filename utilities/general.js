const { ipfsUrls } = require('../constants.js');

exports.getTrimmedWallet = walletAddress => {
    const start = walletAddress.slice(0, 5) || '';
    const end = walletAddress.slice(-5) || '';
    return `${start}...${end}`;
};

exports.getIpfsUrl = (ipfs) => {
    return ipfs
        ? `${ipfsUrls[~~(Math.random() * ipfsUrls.length)]}/${ipfs.slice(7)}`
        : null;
};
