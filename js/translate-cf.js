let translated_dom;
let untranslated_dom;
let view_dom_info = 0;
let is_translating = false;
let is_translated = false;
console.log("RUN");
$("head").append(`
    <style>
        #translate-button{
            padding:2px 4px;
            float:right;
            border:1px solid #000;
            border-radius:6px;
            cursor:pointer;
            user-select:none;
        }
    </style>
`);
$(".problem-statement").before(`
    <div id="translate-button">中文</div>
`);
function rpb(a,b,c=0){
    if(c==false)
        document.getElementsByTagName("body")[0].innerHTML=document.getElementsByTagName("body")[0].innerHTML.replaceAll(a,b);
    else
        document.getElementsByTagName("body")[0].innerHTML=document.getElementsByTagName("body")[0].innerHTML.replaceAll(b,a);
}
function clicfun(){
    console.log([is_translated, is_translating, view_dom_info])
    if (view_dom_info == 0) {
        if (is_translated) {
            $(".translated-dom").show();
            rpb("time limit per test", "单点时间限制");
            rpb("memory limit per test", "单点空间限制");
            rpb("seconds", "秒");
            rpb("megabytes", "兆字节");
            rpb('<div class="property-title">input</div>standard input', '<div class="property-title">输入</div>在标准输入（stdin）中输入');
            rpb('<div class="property-title">output</div>standard output', '<div class="property-title">输出</div>在标准输出（stdout）中输出');
            rpb('<div class="section-title">Input</div>', '<div class="section-title">输入格式</div>');
            rpb('<div class="section-title">Output</div>', '<div class="section-title">输出格式</div>');
            rpb('<div class="section-title">Example</div>', '<div class="section-title">样例输入输出</div>');
            rpb('<div class="title">Input', '<div class="title">样例输入');
            rpb('<div class="title">Output', '<div class="title">样例输出');
            rpb('<div class="section-title">Note</div>', '<div class="section-title">注意</div>');
            $(".undom").hide();
            console.log('ok');
            $("#translate-button").text("英文");
            $("#translate-button").click(clicfun);
            view_dom_info = 1;
            console.log(view_dom_info);
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
        rpb("time limit per test", "单点时间限制",1);
        rpb("memory limit per test", "单点空间限制",1);
        rpb("seconds", "秒",1);
        rpb("megabytes", "兆字节",1);
        rpb('<div class="property-title">input</div>standard input', '<div class="property-title">输入</div>在标准输入（stdin）中输入',1);
        rpb('<div class="property-title">output</div>standard output', '<div class="property-title">输出</div>在标准输出（stdout）中输出',1);
        rpb('<div class="section-title">Input</div>', '<div class="section-title">输入格式</div>',1);
        rpb('<div class="section-title">Output</div>', '<div class="section-title">输出格式</div>',1);
        rpb('<div class="section-title">Example</div>', '<div class="section-title">样例输入输出</div>',1);
        rpb('<div class="title">Input', '<div class="title">样例输入',1);
        rpb('<div class="title">Output', '<div class="title">样例输出',1);
        rpb('<div class="section-title">Note</div>', '<div class="section-title">注意</div>',1);
        console.log('ok');
        $("#translate-button").text("中文");
        $("#translate-button").click(clicfun);
        view_dom_info = 0;
        console.log(view_dom_info);
    }

}

$("#translate-button").click(clicfun);
setTimeout(clicfun,2000);

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
                $("#translate-button").text("错误");
                $("#translate-button").click(clicfun);
                console.log(res.msg);
            } else {
                $("#translate-button").text("稍等");
                $("#translate-button").click(clicfun);
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
                new_text_dom = new_text_dom.replaceAll("{" + j + "}", " " + text_dom_latex_children[j].innerHTML + " ");
            else if(new_text_dom.replace(" " + j + "}", text_dom_latex_children[j].innerHTML)!=new_text_dom)
                new_text_dom = new_text_dom.replaceAll(" " + j + "}", " " + text_dom_latex_children[j].innerHTML + " ");
            else if(new_text_dom.replace("{" + j + " ", text_dom_latex_children[j].innerHTML)!=new_text_dom)
                new_text_dom = new_text_dom.replaceAll("{" + j + " ", " " + text_dom_latex_children[j].innerHTML + " ");
            //console.log(p_children[j].innerHTML);
        };
        $(text_dom_list[i]).after($(text_dom).addClass("translated-dom").removeClass('undom').html(new_text_dom));
    }
    replace_view(translated_dom);
    $(".translated-dom").show();
    $(".undom").hide();
    rpb("time limit per test", "单点时间限制");
    rpb("memory limit per test", "单点空间限制");
    rpb("seconds", "秒");
    rpb("megabytes", "兆字节");
    rpb('<div class="property-title">input</div>standard input', '<div class="property-title">输入</div>在标准输入（stdin）中输入');
    rpb('<div class="property-title">output</div>standard output', '<div class="property-title">输出</div>在标准输出（stdout）中输出');
    rpb('<div class="section-title">Input</div>', '<div class="section-title">输入格式</div>');
    rpb('<div class="section-title">Output</div>', '<div class="section-title">输出格式</div>');
    rpb('<div class="section-title">Example</div>', '<div class="section-title">样例输入输出</div>');
    rpb('<div class="title">Input', '<div class="title">样例输入');
    rpb('<div class="title">Output', '<div class="title">样例输出');
    rpb('<div class="section-title">Note</div>', '<div class="section-title">注意</div>');
    console.log('ok');
    $("#translate-button").text("英文");
    view_dom_info = 1;
    is_translated = true;
    is_translating = false;
    console.log(view_dom_info);
    console.log($("#translate-button"));
    sendResponse({ status: "success" });
    console.log('translate-finished');
    $("#translate-button").click(clicfun);
})