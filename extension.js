const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain('GoogleEarthWallpaper');
const _ = Gettext.gettext;

// required to set lock screen dialog background
const UnlockBackground = Me.imports.unlockdialogbackground;

const GEjsonURL = "https://www.gstatic.com/prettyearth/assets/data/v2/"; // location of image json files
const GEURL = "https://earth.google.com";
const IndicatorName = "GEWallpaperIndicator";
const TIMEOUT_SECONDS = 24 * 3600; // FIXME: this should use the end data from the json data
const TIMEOUT_SECONDS_ON_HTTP_ERROR = 4 * 3600; // retry in one hour if there is a http error
const ICON = "pin";

const imageids = [
    "1003", "1004", "1006", "1007", "1008", "1010", "1012", "1014", "1017", "1018", "1019", "1021", "1022", "1023",
    "1024", "1026", "1027", "1032", "1033", "1034", "1035", "1036", "1037", "1038", "1039", "1040", "1041", "1046",
    "1047", "1048", "1049", "1050", "1052", "1053", "1054", "1055", "1056", "1057", "1063", "1064", "1065", "1066",
    "1067", "1068", "1069", "1070", "1071", "1074", "1075", "1077", "1078", "1080", "1081", "1082", "1084", "1085",
    "1086", "1087", "1089", "1091", "1092", "1093", "1094", "1095", "1096", "1097", "1098", "1099", "1101", "1102",
    "1103", "1104", "1105", "1107", "1109", "1110", "1114", "1115", "1116", "1118", "1119", "1121", "1122", "1123",
    "1125", "1127", "1128", "1131", "1132", "1133", "1134", "1135", "1138", "1139", "1140", "1141", "1143", "1147",
    "1148", "1151", "1152", "1154", "1155", "1156", "1157", "1158", "1159", "1160", "1161", "1163", "1164", "1165",
    "1166", "1167", "1168", "1169", "1170", "1172", "1173", "1174", "1176", "1177", "1178", "1180", "1181", "1183",
    "1184", "1186", "1190", "1191", "1192", "1195", "1196", "1197", "1198", "1199", "1206", "1207", "1209", "1211",
    "1212", "1215", "1216", "1217", "1221", "1222", "1224", "1225", "1226", "1229", "1230", "1231", "1233", "1237",
    "1238", "1239", "1240", "1241", "1242", "1243", "1245", "1247", "1248", "1251", "1253", "1254", "1255", "1256",
    "1257", "1258", "1259", "1260", "1265", "1267", "1268", "1269", "1270", "1273", "1274", "1277", "1280", "1282",
    "1285", "1286", "1287", "1289", "1290", "1292", "1293", "1297", "1298", "1300", "1301", "1302", "1308", "1309",
    "1312", "1316", "1317", "1323", "1324", "1325", "1326", "1329", "1332", "1336", "1337", "1338", "1341", "1342",
    "1343", "1345", "1348", "1349", "1350", "1351", "1352", "1353", "1354", "1355", "1356", "1358", "1359", "1363",
    "1364", "1368", "1369", "1370", "1371", "1373", "1374", "1375", "1377", "1378", "1381", "1383", "1385", "1388",
    "1393", "1394", "1396", "1397", "1398", "1399", "1400", "1402", "1403", "1406", "1407", "1408", "1409", "1413",
    "1414", "1416", "1417", "1418", "1419", "1420", "1421", "1423", "1427", "1429", "1430", "1432", "1434", "1435",
    "1436", "1437", "1438", "1440", "1443", "1444", "1446", "1447", "1448", "1449", "1450", "1451", "1456", "1457",
    "1463", "1464", "1466", "1468", "1470", "1471", "1472", "1474", "1475", "1476", "1477", "1478", "1484", "1485",
    "1487", "1488", "1490", "1491", "1492", "1494", "1495", "1496", "1498", "1500", "1501", "1502", "1505", "1506",
    "1508", "1509", "1510", "1511", "1512", "1514", "1515", "1516", "1517", "1518", "1519", "1521", "1523", "1525",
    "1526", "1528", "1529", "1530", "1531", "1534", "1537", "1538", "1539", "1540", "1541", "1542", "1543", "1544",
    "1545", "1546", "1548", "1550", "1551", "1553", "1556", "1557", "1558", "1559", "1560", "1561", "1563", "1565",
    "1567", "1568", "1569", "1572", "1574", "1578", "1579", "1582", "1583", "1584", "1585", "1588", "1589", "1591",
    "1594", "1595", "1598", "1600", "1606", "1607", "1608", "1609", "1610", "1611", "1612", "1613", "1614", "1615",
    "1617", "1618", "1620", "1623", "1626", "1628", "1629", "1630", "1634", "1636", "1637", "1639", "1640", "1641",
    "1643", "1644", "1645", "1646", "1648", "1652", "1653", "1655", "1657", "1660", "1661", "1662", "1663", "1664",
    "1666", "1668", "1669", "1672", "1673", "1674", "1675", "1676", "1681", "1683", "1684", "1685", "1686", "1687",
    "1688", "1689", "1690", "1692", "1694", "1695", "1697", "1698", "1699", "1701", "1702", "1703", "1704", "1707",
    "1710", "1711", "1712", "1713", "1714", "1716", "1718", "1719", "1720", "1721", "1722", "1724", "1725", "1727",
    "1728", "1729", "1730", "1731", "1732", "1734", "1735", "1737", "1738", "1739", "1740", "1741", "1742", "1746",
    "1750", "1754", "1756", "1758", "1759", "1760", "1761", "1762", "1763", "1766", "1767", "1768", "1770", "1771",
    "1772", "1774", "1775", "1776", "1777", "1778", "1779", "1780", "1782", "1783", "1784", "1785", "1786", "1787",
    "1788", "1790", "1792", "1793", "1796", "1797", "1799", "1800", "1801", "1804", "1805", "1806", "1807", "1808",
    "1809", "1810", "1811", "1812", "1816", "1817", "1820", "1821", "1822", "1823", "1824", "1825", "1826", "1828",
    "1829", "1831", "1832", "1833", "1834", "1835", "1836", "1837", "1838", "1839", "1840", "1841", "1842", "1843",
    "1844", "1845", "1846", "1849", "1852", "1853", "1854", "1855", "1857", "1858", "1859", "1860", "1861", "1863",
    "1864", "1868", "1870", "1872", "1873", "1875", "1883", "1884", "1885", "1887", "1888", "1889", "1890", "1891",
    "1893", "1894", "1897", "1901", "1902", "1903", "1904", "1905", "1907", "1908", "1909", "1910", "1911", "1912",
    "1913", "1915", "1919", "1920", "1921", "1922", "1923", "1924", "1925", "1927", "1934", "1935", "1936", "1937",
    "1938", "1939", "1940", "1942", "1943", "1945", "1946", "1947", "1948", "1949", "1951", "1952", "1954", "1955",
    "1956", "1957", "1959", "1960", "1961", "1962", "1964", "1965", "1966", "1967", "1968", "1969", "1970", "1971",
    "1972", "1973", "1974", "1975", "1976", "1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1986",
    "1987", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1998", "1999", "2000", "2001", "2002", "2003",
    "2007", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2021", "2022", "2023",
    "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036", "2037",
    "2038", "2039", "2040", "2041", "2042", "2043", "2044", "2045", "2046", "2047", "2048", "2049", "2050", "2051",
    "2052", "2054", "2055", "2056", "2057", "2058", "2059", "2060", "2061", "2062", "2063", "2064", "2065", "2066",
    "2067", "2068", "2069", "2070", "2071", "2072", "2074", "2075", "2076", "2078", "2081", "2082", "2083", "2084",
    "2088", "2090", "2091", "2093", "2095", "2096", "2097", "2098", "2100", "2102", "2103", "2109", "2112", "2113",
    "2116", "2118", "2120", "2121", "2124", "2125", "2126", "2131", "2132", "2135", "2137", "2138", "2139", "2140",
    "2141", "2142", "2145", "2147", "2148", "2149", "2150", "2151", "2152", "2154", "2156", "2157", "2159", "2160",
    "2161", "2162", "2165", "2166", "2167", "2168", "2169", "2170", "2171", "2175", "2176", "2177", "2179", "2180",
    "2181", "2182", "2183", "2186", "2187", "2188", "2190", "2191", "2192", "2194", "2195", "2197", "2198", "2199",
    "2202", "2203", "2204", "2205", "2206", "2207", "2209", "2211", "2212", "2213", "2216", "2218", "2220", "2222",
    "2223", "2224", "2227", "2228", "2229", "2230", "2231", "2237", "2239", "2240", "2241", "2243", "2244", "2246",
    "2247", "2248", "2249", "2251", "2252", "2253", "2256", "2258", "2259", "2260", "2263", "2264", "2265", "2266",
    "2268", "2269", "2270", "2272", "2273", "2274", "2275", "2276", "2277", "2278", "2280", "2281", "2284", "2287",
    "2288", "2290", "2291", "2292", "2293", "2294", "2295", "2296", "2297", "2299", "2303", "2304", "2305", "2307",
    "2308", "2311", "2312", "2313", "2314", "2315", "2316", "2317", "2318", "2319", "2321", "2322", "2323", "2324",
    "2325", "2326", "2327", "2329", "2330", "2331", "2332", "2333", "2334", "2337", "2340", "2341", "2342", "2343",
    "2344", "2345", "2346", "2347", "2350", "2357", "2360", "2361", "2364", "2367", "2368", "2371", "2372", "2374",
    "2375", "2377", "2378", "2379", "2380", "2381", "2382", "2383", "2385", "2386", "2388", "2389", "2390", "2391",
    "2392", "2393", "2395", "2397", "2398", "2399", "2401", "2402", "2403", "2405", "2406", "2407", "2408", "2409",
    "2410", "2411", "2412", "2413", "2414", "2416", "2418", "2419", "2421", "2422", "2423", "2426", "2430", "2431",
    "2432", "2433", "2434", "2435", "2436", "2437", "2438", "2439", "2442", "2443", "2444", "2446", "2447", "2448",
    "5003", "5004", "5005", "5007", "5008", "5012", "5015", "5016", "5019", "5022", "5023", "5027", "5028", "5035",
    "5037", "5038", "5039", "5040", "5041", "5043", "5044", "5045", "5046", "5047", "5048", "5051", "5052", "5053",
    "5056", "5057", "5060", "5062", "5063", "5064", "5065", "5066", "5071", "5072", "5073", "5076", "5077", "5078",
    "5079", "5080", "5081", "5082", "5097", "5103", "5104", "5105", "5111", "5121", "5126", "5147", "5163", "5164",
    "5165", "5167", "5168", "5172", "5173", "5178", "5179", "5181", "5182", "5183", "5188", "5189", "5192", "5198",
    "5199", "5206", "5207", "5215", "5216", "5217", "5228", "5231", "5234", "5237", "5238", "5242", "5243", "5244",
    "5245", "5253", "5254", "5255", "5290", "5296", "5302", "5304", "5310", "5314", "5319", "5325", "5329", "5330",
    "5333", "5334", "5338", "5355", "5361", "5365", "5375", "5382", "5389", "5396", "5403", "5412", "5422", "5423",
    "5424", "5425", "5426", "5438", "5445", "5451", "5452", "5454", "5456", "5457", "5460", "5461", "5462", "5464",
    "5474", "5479", "5480", "5481", "5484", "5485", "5487", "5502", "5508", "5511", "5513", "5527", "5528", "5529",
    "5530", "5531", "5533", "5536", "5538", "5542", "5551", "5553", "5555", "5556", "5560", "5562", "5563", "5564",
    "5565", "5569", "5575", "5577", "5583", "5584", "5586", "5587", "5588", "5589", "5591", "5594", "5595", "5596",
    "5597", "5604", "5607", "5609", "5611", "5612", "5614", "5616", "5617", "5618", "5619", "5620", "5624", "5626",
    "5628", "5629", "5630", "5634", "5635", "5636", "5641", "5646", "5651", "5653", "5654", "5660", "5663", "5666",
    "5668", "5674", "5675", "5676", "5686", "5688", "5689", "5692", "5705", "5720", "5723", "5724", "5729", "5741",
    "5744", "5749", "5755", "5761", "5762", "5763", "5766", "5767", "5770", "5773", "5778", "5786", "5787", "5790",
    "5792", "5795", "5796", "5797", "5809", "5810", "5818", "5822", "5828", "5829", "5836", "5855", "5859", "5862",
    "5864", "5870", "5874", "5882", "5884", "5890", "5898", "5901", "5924", "5933", "5938", "5941", "5944", "5945",
    "5951", "5952", "5954", "5955", "5957", "5958", "5959", "5960", "5964", "5975", "5977", "5978", "5979", "5981",
    "5982", "5984", "5989", "5992", "5995", "5999", "6001", "6002", "6003", "6004", "6005", "6006", "6007", "6008",
    "6011", "6013", "6014", "6015", "6016", "6017", "6018", "6019", "6022", "6025", "6032", "6041", "6043", "6044",
    "6045", "6046", "6048", "6049", "6050", "6051", "6052", "6053", "6054", "6055", "6056", "6057", "6058", "6059",
    "6060", "6062", "6063", "6065", "6066", "6068", "6069", "6070", "6072", "6073", "6074", "6078", "6079", "6080",
    "6081", "6082", "6095", "6096", "6097", "6099", "6100", "6101", "6102", "6103", "6105", "6107", "6108", "6109",
    "6110", "6112", "6114", "6116", "6117", "6119", "6120", "6121", "6122", "6124", "6125", "6134", "6135", "6136",
    "6137", "6138", "6139", "6140", "6141", "6143", "6144", "6146", "6149", "6150", "6151", "6152", "6153", "6155",
    "6160", "6161", "6167", "6170", "6175", "6176", "6177", "6178", "6180", "6181", "6182", "6183", "6184", "6186",
    "6187", "6189", "6201", "6202", "6204", "6205", "6206", "6207", "6208", "6209", "6210", "6211", "6213", "6215",
    "6216", "6217", "6218", "6222", "6228", "6229", "6230", "6231", "6232", "6233", "6234", "6235", "6241", "6244",
    "6248", "6254", "6255", "6256", "6257", "6258", "6259", "6260", "6262", "6263", "6264", "6265", "6266", "6267",
    "6269", "6271", "6272", "6275", "6276", "6279", "6280", "6281", "6282", "6283", "6284", "6285", "6287", "6290",
    "6291", "6292", "6293", "6294", "6295", "6296", "6298", "6300", "6301", "6302", "6303", "6304", "6311", "6313",
    "6315", "6316", "6317", "6318", "6319", "6320", "6321", "6324", "6325", "6326", "6339", "6340", "6341", "6342",
    "6344", "6345", "6346", "6347", "6348", "6349", "6350", "6351", "6352", "6355", "6356", "6358", "6359", "6360",
    "6361", "6362", "6363", "6364", "6365", "6366", "6367", "6368", "6371", "6372", "6374", "6375", "6376", "6377",
    "6378", "6379", "6380", "6381", "6382", "6383", "6384", "6386", "6387", "6388", "6389", "6402", "6409", "6410",
    "6424", "6435", "6436", "6441", "6443", "6457", "6459", "6460", "6465", "6470", "6473", "6488", "6491", "6495",
    "6496", "6498", "6500", "6503", "6504", "6510", "6512", "6519", "6524", "6525", "6527", "6528", "6531", "6543",
    "6545", "6561", "6565", "6566", "6575", "6578", "6579", "6587", "6588", "6589", "6590", "6600", "6607", "7001",
    "7002", "7003", "7004", "7005", "7006", "7008", "7009", "7010", "7011", "7012", "7013", "7015", "7016", "7017",
    "7018", "7019", "7020", "7021", "7023" ];

const providerNames = ['Google Earth', 'Google Maps', 'Bing Maps', 'OpenStreetMap' , 'GNOME Maps'];
let googleearthWallpaperIndicator=null;
let httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(httpSession, new Soup.ProxyResolverDefault());

function log(msg) {
    if (googleearthWallpaperIndicator==null || googleearthWallpaperIndicator._settings.get_boolean('debug-logging'))
        print("GEWallpaper extension: " + msg); // disable to keep the noise down in journal
}

function notifyError(msg) {
    Main.notifyError("GEWallpaper extension error", msg);
}

function doSetBackground(uri, schema) {
    let gsettings = new Gio.Settings({schema: schema});
    gsettings.set_string('picture-uri', 'file://' + uri);
    gsettings.set_string('picture-options', 'zoom');
    Gio.Settings.sync();
    gsettings.apply();
}

const GEWallpaperIndicator = new Lang.Class({
    Name: IndicatorName,
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, IndicatorName);

        this.icon = new St.Icon({icon_name: ICON, style_class: 'system-status-icon'});
        this.x_fill = true;
        this.y_fill = false;
        this.title = "";
        this.explanation = "";
        this.filename = "";
        this.copyright = "";
        this.provider_text = "";
        this._updatePending = false;
        this._timeout = null;
        this.lat = 0;
        this.lon = 0;
        this.zoom = 0;
        this.link = "https://earthview.withgoogle.com/";
        this.imageid = 0;
        this.refreshdue = 0; // UNIX timestamp when next refresh is due

        this._settings = Utils.getSettings();
        this._settings.connect('changed::hide', Lang.bind(this, function() {
            this.actor.visible = !this._settings.get_boolean('hide');
        }));
        this.actor.visible = !this._settings.get_boolean('hide');

        this._settings.connect('changed::map-link-provider', Lang.bind(this, function() {
            this._updateProviderLink();
        }));

        // this is how we handle dynamic icon brightness
        this.bright_effect = new Clutter.BrightnessContrastEffect({});
        this.bright_effect.set_brightness(-1.0 + (Utils.clamp_value(this._settings.get_int('brightness'),0,100)/100.0));
        this.bright_effect.set_contrast(0);
        this.icon.add_effect_with_name('brightness-contrast', this.bright_effect);
        this.actor.add_child(this.icon);
        // connect to brightness setting
        this._settings.connect('changed::brightness', Lang.bind(this, function() {
          this.bright_effect.set_contrast(0);
          this.bright_effect.set_brightness(-1.0 + (Utils.clamp_value(this._settings.get_int('brightness'),0,100)/100.0));
        }));

        // enable or disable lockscreen *dialog* background (this is handled separately to the lockscreen background!)
        this._settings.connect('changed::set-lock-screen-dialog', Lang.bind(this, function() {
            UnlockBackground.set_active(this._settings.get_boolean('set-lock-screen-dialog'));
        }));
        // set initial state
        UnlockBackground.set_active(this._settings.get_boolean('set-lock-screen-dialog'));

        this.refreshDueItem = new PopupMenu.PopupMenuItem(_("<No refresh scheduled>"));
        this.descriptionItem = new PopupMenu.PopupMenuItem(_("Text Location"));
        this.locationItem = new PopupMenu.PopupMenuItem(_("Geo Location"));
        this.extLinkItem = new PopupMenu.PopupMenuItem(_("External Link"));
        this.copyrightItem = new PopupMenu.PopupMenuItem(_("Copyright"));
        this.wallpaperItem = new PopupMenu.PopupMenuItem(_("Set wallpaper"));
        this.refreshItem = new PopupMenu.PopupMenuItem(_("Refresh Now"));
        this.settingsItem = new PopupMenu.PopupMenuItem(_("Settings"));
        this.menu.addMenuItem(this.descriptionItem);
        this.menu.addMenuItem(this.locationItem);
        this.menu.addMenuItem(this.extLinkItem);
        this.menu.addMenuItem(this.refreshDueItem);
        this.menu.addMenuItem(this.refreshItem);
        this.menu.addMenuItem(this.wallpaperItem);
        this.menu.addMenuItem(this.settingsItem);
        this.refreshDueItem.setSensitive(false);
        this.descriptionItem.setSensitive(false);
        this.locationItem.setSensitive(false);
        this.extLinkItem.connect('activate', Lang.bind(this, function() {
            Util.spawn(["xdg-open", this.link]);
        }));
        this.wallpaperItem.connect('activate', Lang.bind(this, this._setBackground));
        this.refreshItem.connect('activate', Lang.bind(this, this._refresh));
        this.settingsItem.connect('activate', function() {
            Util.spawn(["gnome-shell-extension-prefs", Me.metadata.uuid]);
        });

        this.actor.connect('button-press-event', Lang.bind(this, this._updateMenu));

        if (this._settings.get_int('next-refresh') > 0 ) {
            this._restorePreviousState();
        }
        else {
            log("no previous state to restore... (first run?)");
            this._restartTimeout(60); // wait 60 seconds before performing refresh
        }
    },

    _restorePreviousState () {
        log("restoring previous state...");
        this.title = _("Google Earth Wallpaper");
        let imagedata = this._settings.get_string('image-details').split('|');
        if (imagedata.length > 0 ) {
          this.explanation = imagedata[0];
          this.copyright = imagedata[1];
        }
        if (imagedata.length > 2) { // special case handle previous extension version data gaps
          this.lat = parseFloat(imagedata[2]);
          this.lon = parseFloat(imagedata[3]);
          this.zoom = parseInt(imagedata[4]);
        }
        this.filename = this._settings.get_string('image-filepath');
        let timezone = GLib.TimeZone.new_local();
        let unixtime = GLib.DateTime.new_now(timezone).to_unix();
        let seconds = this._settings.get_int('next-refresh') - unixtime;
        log(" image: "+this.filename+" explanation: "+this.explanation+"\n next refresh in: "+seconds+" seconds");
        this._updateProviderLink();
        this._setBackground();
        this._restartTimeout(seconds < 60 ? 60 : seconds); // never refresh early than 60 seconds after startup
    },

    _updateMenu: function () {
        // Grey out menu items if an update is pending
        this.refreshItem.setSensitive(!this._updatePending);
        this.wallpaperItem.setSensitive(!this._updatePending && this.filename != "");
        // update menu text
        this.refreshDueItem.label.set_text(_('Next refresh')+': '+this.refreshdue.format('%X')+' ('+Utils.friendly_time_diff(this.refreshdue)+')');
        this.locationItem.label.set_text(Utils.friendly_coordinates(this.lat, this.lon));
        this.descriptionItem.label.set_text(this.explanation);
        this.copyrightItem.label.set_text(this.copyright);
        this.extLinkItem.label.set_text(this.provider_text);
    },

    _updateProviderLink: function() {
      let provider = this._settings.get_enum('map-link-provider');
      switch(provider) {
        case 1: // Google Maps
          this.link = 'https://www.google.com/maps/@?api=1&map_action=map'+'&'+
                        'center=' + this.lat + ',' + this.lon + '&' +
                        'zoom=' + this.zoom + '&' + 'basemap=satellite' + '&'
                        'layer=none';
          break;
        case 2: // Bing Maps
          this.link = 'https://bing.com/maps/default.aspx?' +
                        'cp=' + this.lat + '~' + this.lon + '&' +
                        'lvl=' + this.zoom + '&' + 'style=a' + '&' +
                        'dir=0';
          break;
        case 3: // OpenStreetMap
          this.link = 'https://www.openstreetmap.org/#map=' +
                        this.zoom + '/' + this.lat + '/' + this.lon;
          break;
        case 4: // GNOME Maps (most likely, or whatever is default app for geo: uris)
          this.link = 'geo:'+this.lat+','+this.lon;
          break;

        case 0: // Google Earth
        default:
          this.link = 'https://g.co/ev/'+this.imageid;
      }
      this.provider_text = _("View in ") + providerNames[provider];
    },

    _setBackground: function() {
        if (this.filename == "")
            return;
        if (this._settings.get_boolean('set-background')) {
            doSetBackground(this.filename, 'org.gnome.desktop.background');
        }
        if (this._settings.get_boolean('set-lock-screen')) {
            doSetBackground(this.filename, 'org.gnome.desktop.screensaver');
        }
    },

    _restartTimeout: function(seconds = null) {
        if (this._timeout)
            Mainloop.source_remove(this._timeout);
        if (seconds == null || seconds < 60)
            seconds = TIMEOUT_SECONDS;
        this._timeout = Mainloop.timeout_add_seconds(seconds, Lang.bind(this, this._refresh));
        let timezone = GLib.TimeZone.new_local();
        let localTime = GLib.DateTime.new_now(timezone).add_seconds(seconds);
        this.refreshdue = localTime;
        this._settings.set_int('next-refresh',localTime.to_unix());
        log('next check in '+seconds+' seconds @ local time '+localTime.format('%F %X'));
    },

    _refresh: function() {
        if (this._updatePending)
            return;
        this._updatePending = true;
        this._restartTimeout(300); // in case of a timeout
        this.refreshDueItem.label.set_text(_('Fetching...'));

        log('locations count: '+imageids.length);
        // create an http message
        let imgindex = GLib.random_int_range(0,imageids.length);
        let url = GEjsonURL+imageids[imgindex]+'.json';
        log("fetching: " + url);
        let request = Soup.Message.new('GET', url);

        // queue the http request
        httpSession.queue_message(request, Lang.bind(this, function(httpSession, message) {
            if (message.status_code == 200) {
                let data = message.response_body.data;
                log("Recieved "+data.length+" bytes");
                this._parseData(data);
            } else if (message.status_code == 403) {
                log("Access denied: "+message.status_code);
                this._updatePending = false;
                this._restartTimeout(TIMEOUT_SECONDS_ON_HTTP_ERROR);
            } else {
                log("Network error occured: "+message.status_code);
                this._updatePending = false;
                this._restartTimeout(TIMEOUT_SECONDS_ON_HTTP_ERROR);
            }
        }));
    },

    _parseData: function(data) {
        let imagejson = JSON.parse(data);

        if (imagejson['id'] != '') {
            this.title = _("Google Earth Wallpaper");
            let location = "";
            let linelen = 0;
            for (var i in imagejson['geocode']) {
                if (location != "" && isNaN(location)) {
                    location += ", ";
                    linelen += 2;
                }
                else {
                    location += " ";
                    linelen += 2;
                }
                if (linelen > 40) {
                     location += "\n";
                     linelen = 0;
                }
               location += imagejson['geocode'][i];
               linelen += imagejson['geocode'][i].length;
               log('location: '+location+' length: '+linelen);
            }
            let coordinates = Utils.friendly_coordinates(imagejson['lat'],imagejson['lng']);
            this.explanation = location.trim(); // + '\n'+ coordinates;
            this.copyright = imagejson['attribution'];
            this.lat = imagejson['lat'];
            this.lon = imagejson['lng'];
            this.zoom = imagejson['zoom'];
            this.imageid = imagejson['id'];
            this._updateProviderLink();

            let GEWallpaperDir = this._settings.get_string('download-folder');
            let userPicturesDir = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES); // XDG pictures directory
            if (GEWallpaperDir == '') {
                GEWallpaperDir = userPicturesDir + "/GoogleEarthWallpaper/";
                this._settings.set_string('download-folder',GEWallpaperDir);
            }
            else if (!GEWallpaperDir.endsWith('/')) {
                GEWallpaperDir += '/';
            }

            let prevfile = this._settings.get_string('image-filepath');
            this.filename = GEWallpaperDir+imagejson['id']+'-'+location.trim().replace(',','').replace(/[^a-z0-9]+/gi, '_').toLowerCase()+'.jpg';
            let file = Gio.file_new_for_path(this.filename);
            let file_exists = file.query_exists(null);
            let file_info = file_exists ? file.query_info ('*',Gio.FileQueryInfoFlags.NONE,null): 0;

            if (!file_exists || file_info.get_size () == 0) { // file doesn't exist or is empty (probably due to a network error)
                let dir = Gio.file_new_for_path(GEWallpaperDir);
                if (!dir.query_exists(null)) {
                    dir.make_directory_with_parents(null);
                }
                this._export_image(imagejson,file);
                this._settings.set_string('image-filepath', this.filename);
                this._delete_previous(prevfile);
            } else {
                log("Image already downloaded");
                this._setBackground();
                this._updatePending = false;
            }
            this._settings.set_string('image-details',[
                this.explanation.replace('|', ''), // just incase (see below)
                this.copyright.replace('|', '&'), // i think copyright info uses | instead of &
                this.lat.toString(),
                this.lon.toString(),
                this.zoom.toString()].join('|'));
            this._settings.set_int('image-id',imagejson['id']);
        } else {
            this.title = _("No wallpaper available");
            this.explanation = _("Something went wrong...");
            this.filename = "";
            this._updatePending = false;
        }
        this._updateMenu();
        this._restartTimeout(this._settings.get_int('refresh-interval'));
    },

    _delete_previous: function (to_delete) {
        if (to_delete == '')
            return;
        let deletepictures = this._settings.get_boolean('delete-previous');
        if (deletepictures) {
            let oldfile = Gio.file_new_for_path(to_delete);
            if (oldfile.query_exists(null)) {
                oldfile.delete(null);
                log("deleted previous file: "+ to_delete);
            }
        }
    },

    _export_image: function(json, file) {
        log("Exporting to " + file.get_uri())

        // open the Gfile
        let fstream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let decodeddata = GLib.base64_decode(json.dataUri.replace('data:image/jpeg;base64,','')); // FIXME: how do we handle failures? check for magic number/JFIF?
        fstream.write(decodeddata, null);
        fstream.close(null);
        this._updatePending = false;

        this._setBackground();
    },

    stop: function () {
        if (this._timeout)
            Mainloop.source_remove(this._timeout);
        this._timeout = undefined;
        this.menu.removeAll();
    }
});

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
    Convenience.initTranslations("GoogleEarthWallpaper");
    UnlockBackground.init();
	log("init() called");
}

function enable() {
    googleearthWallpaperIndicator = new GEWallpaperIndicator();
    Main.panel.addToStatusArea(IndicatorName, googleearthWallpaperIndicator);
	log("enable() called");
}

function disable() {
    log("disable() called");
    if (this._timeout)
            Mainloop.source_remove(this._timeout); // not strictly sure this is necessary, but let's clean it up anyway
    googleearthWallpaperIndicator.stop();
    googleearthWallpaperIndicator.destroy();
    googleearthWallpaperIndicator = null;
}