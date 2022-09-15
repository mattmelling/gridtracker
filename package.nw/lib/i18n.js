let languages = {
    en: "i18n/en.json",
    es: "i18n/es.json",
    cn: "i18n/cn.json",
    cnt: "i18n/cn-t.json",
    de: "i18n/de.json",
    ja: "i18n/ja.json"
};


function loadi18n() {
    $.i18n().load(languages).done(function () {
        $.i18n().locale = g_appSettings.locale;
    });
}

function renderI18n(locale)
{
  $.i18n().locale = locale;
  $("body").i18n();
}

function changeLocale()
{
  g_appSettings.locale = languageLocale.value;
  renderI18n(g_appSettings.locale);
}

function loadChildWindowI18n() {
    $.i18n().load(languages).done(function () {
        renderI18n(window.opener.g_appSettings.locale);
    });
}

function loadRosteri18n() {
    $.i18n().load(languages).done(function () {
        renderI18n(window.opener.g_appSettings.locale);
        addControls();
    });
}

function renderLocale()
{
  renderI18n(g_appSettings.locale);
}
