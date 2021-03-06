const { gql, request } = require('graphql-request');
const { getIpfsUrl } = require('../utilities/general.js');

const query = gql`
    query AudioObjktData {
        hic_et_nunc_token(where: {
            mime: {_in: ["audio/ogg", "audio/wav", "audio/mpeg"]},
            token_holders: {
                quantity: {_gt: "0"},
                holder_id: {_neq: "tz1burnburnburnburnburnburnburjAYjjX"}
            }
        }, order_by: {id: desc}) {
            id
            display_uri
            title
            description
            thumbnail_uri
            mime
            creator_id
            artifact_uri
            token_tags {
                tag {
                    tag
                }
            }
            creator {
                name
                metadata
            }
            supply
            token_holders(where: {holder_id: {_eq: "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn"}}) {
                quantity
            }
            swaps(where: {status: {_eq: "0"}, contract_version: {_neq: "1"}}, order_by: {price: asc}) {
                price
            }
        }
    }
`;

exports.getAllTracks = async() => {
    const response = await request('https://api.hicdex.com/v1/graphql', query);
    return response.hic_et_nunc_token.map(o => ({
        id: o.id,
        creator: {
            walletAddress: o.creator_id,
            ...o.creator,
        },
        title: o.title,
        src: getIpfsUrl(o.artifact_uri),
        mimeType: o.mime,
        displayUri: o.display_uri,
        description: o.description,
        tags: o.token_tags.map(tt => tt.tag.tag),
    })) || [];
};

