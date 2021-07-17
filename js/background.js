let translate_ajax = {
    google: (query_list, callback) => {
        $.ajax({
            url: 'http://translate.google.cn/translate_a/single',
            type: 'POST',
            dataType: "json",
            data: {
                client: "gtx",
                dt: "t",
                dj: "1",
                ie: "UTF-8",
                sl: "auto",
                tl: "zh-CN",
                signType: "v3",
                q: query_list.join("\n\n")
            },
            success: function(data) {
                let res = "";
                for (let sen of data.sentences) {
                    res += sen.trans;
                }
                res=res.replaceAll("{ ","{");
                res=res.replaceAll(" }","}");
                callback(res.split("\n\n"));
            }
        });
    },
    youdao: (query_list, callback) => {
        $.ajax({
            url: 'http://fanyi.youdao.com/translate',
            type: 'POST',
            dataType: "json",
            data: {
                doctype: "json",
                type: "AUTO",
                i: query_list.join("\n")
            },
            success: function(data) {
                let res = [];
                for (let sens of data.translateResult) {
                    let tmp = "";
                    for (let sen of sens) {
                        tmp += sen.tgt;
                    }
                    res.push(tmp);
                }
                callback(res);
            }
        });
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    translate_ajax.google(request.data, (data) => {
        chrome.tabs.sendMessage(sender.tab.id, data, function(response) {

        });
    });
    sendResponse({ status: "success" });
})