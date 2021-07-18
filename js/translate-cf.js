let translated_dom;
let untranslated_dom;
let view_dom_info = 0;
let is_translating = false;
let is_translated = false;
let ctrl_botton;
console.log("RUN");
$(".problem-statement").before(`
    <style>
        #translate-botton{
            padding:2px 4px;
            float:right;
            border:1px solid #000;
            border-radius:6px;
            cursor:pointer;
            user-select:none;
        }
    </style>
    <div id="translate-botton">中文</div>
`);
ctrl_botton = $("#translate-botton");
$(ctrl_botton).click(() => {
    console.log([is_translated, is_translating, view_dom_info])
    if (view_dom_info == 0) {
        if (is_translated) {
            $(".translated-dom").show();
            $(".undom").hide();
            $(ctrl_botton).text("英文");
            view_dom_info = 1;
        } else if (is_translating) {
            //do-nothing
        } else {
            view_dom = $(".problem-statement");
            is_translating = true;
            translate();
        }
    } else {
        $(".translated-dom").hide();
        $(".undom").show();
        $(ctrl_botton).text("中文");
        view_dom_info = 0;
    }

})

function replace_view(dom) {
    dom = $(dom).clone();
    $(".ttypography").find(".problem-statement").remove();
    $(".ttypography").append(dom);
}
function translate() {
    $(".problem-statement").children("div").find("p,li,strong,i,img").addClass('undom');
    untranslated_dom = $(".problem-statement").clone();
    let tmp_dom = $(untranslated_dom).clone();
    let text_dom_list = $(tmp_dom).children("div").find("p,li,strong,i,img");
    let text_list = [];
    for (let i = 0; i < text_dom_list.length; i++) {
        let text_dom = text_dom_list[i];
        $(text_dom).find("[type='math/tex'],script").remove();
        let text_dom_latex_children = $(text_dom).children("*");
        for (let j = 0; j < text_dom_latex_children.length; j++) {
            $(text_dom_latex_children[j]).replaceWith("{" + j + "}");
        }
        text_list.push($(text_dom).text());
    }
    chrome.runtime.sendMessage({
            url: window.location.href,
            data: text_list
        },
        (res) => {
            console.log(res);
            if (res.status != "success") {
                $(ctrl_botton).text("错误");
                console.log(res.msg);
            } else {
                $(ctrl_botton).text("稍等");
            }
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    translated_dom = $(untranslated_dom).clone();
    let text_dom_list = $(translated_dom).children("div").find("p,li,strong,i,img");
    for (let i = 0; i < text_dom_list.length; i++) {
        let text_dom = $(text_dom_list[i]).clone();
        $(text_dom).find("[type='math/tex'],script").remove();
        let text_dom_latex_children = $(text_dom).children("*").clone();
        let new_text_dom = request[i];
        for (let j = 0; j < text_dom_latex_children.length; j++) {
            if(new_text_dom.replace("{" + j + "}", text_dom_latex_children[j].innerHTML)!=new_text_dom)
                new_text_dom = new_text_dom.replaceAll("{" + j + "}", text_dom_latex_children[j].innerHTML);
            else if(new_text_dom.replace(" " + j + "}", text_dom_latex_children[j].innerHTML)!=new_text_dom)
                new_text_dom = new_text_dom.replaceAll(" " + j + "}", text_dom_latex_children[j].innerHTML);
            else if(new_text_dom.replace("{" + j + " ", text_dom_latex_children[j].innerHTML)!=new_text_dom)
                new_text_dom = new_text_dom.replaceAll("{" + j + " ", text_dom_latex_children[j].innerHTML);
            //console.log(p_children[j].innerHTML);
        };
        $(text_dom_list[i]).after($(text_dom).addClass("translated-dom").removeClass('undom').html(new_text_dom));
    }
    replace_view(translated_dom);
    $(".translated-dom").show();
    $(".undom").hide();
    $(ctrl_botton).text("英文");
    view_dom_info = 1;
    is_translated = true;
    is_translating = false;
    sendResponse({ status: "success" });
})