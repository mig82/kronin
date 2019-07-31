
$KW.DataGrid = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "DataGrid", this.eventHandler);
        },

        initializeView: function(formId) {
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);

            switch(propertyName) {
                case "skin":
                case "alternateskin":
                case "rownormalskin":
                case "rowalternateskin":
                    element && this.applyRowSkin(widgetModel, element);
                    break;

                case "focusskin":
                case "rowfocusskin":
                    
                    break;

                case "headerskin":
                    if(element) {
                        var headerRow = element.tHead && element.tHead.rows[0];
                        if(headerRow) headerRow.className = propertyValue;
                    }
                    break;

                case "gridlinecolor":
                case "gridlinestyle":
                    this.applyCellBorder(widgetModel);
                    break;


                case "showcolumnheaders":
                    if(element) {
                        var headerRow = element.tHead && element.tHead.rows[0];
                        if(headerRow) {
                            if(propertyValue)
                                headerRow.style.display = "";
                            else
                                headerRow.style.display = "none";
                        }
                    }
                    break

                case "ismultiselect":
                    if(!propertyValue && widgetModel.selectedindices) {
                        widgetModel.selectedindices = widgetModel.selecteditems = null;
                        this.setSelectedItems(widgetModel, true);
                    }
                    break;

                case "data":
                    $KU.isArray(propertyValue) && this.modifyContent(widgetModel, propertyValue, "setdata");
                    break;

                case "columnheadersconfig":
                    if(element) {
                        var htmlstring = module.render(widgetModel, widgetModel.context);
                        element.parentNode.innerHTML = htmlstring;
                    }
                    break;
            }
        },

        
        render: function(gridModel, context) {
            gridModel.context = context;
            this.initializeGrid(gridModel);
            var parentModel = gridModel.parent;
            if($KW.FlexUtils.isFlexContainer(parentModel))
                gridModel.layoutConfig.self = true;
            return this.create(gridModel, context);
        },

        
        initializeGrid: function(gridModel) {
            if(!gridModel.columnheadersconfig)
                return;

            gridModel.rowcount = (gridModel.data && gridModel.data.length - IndexJL) || 0;
            gridModel.gridlinestyle = gridModel.gridlinestyle || "solid";
            gridModel.gridlinecolor = gridModel.gridlinecolor || "666666";
            gridModel.focusedindex = gridModel.selectedindex = gridModel.focusedindex || gridModel.selectedindex || null;
            gridModel.focuseditem = gridModel.selecteditem = gridModel.focuseditem || gridModel.selecteditem || null;
            gridModel.selectedindices = gridModel.selectedindices || null;
            gridModel.selecteditems = gridModel.selecteditems || null;
            if(gridModel.ismultiselect && gridModel.selectedindices && !gridModel.selecteditems) {
                this.setSelectedItems(gridModel);
            }
            gridModel.cellBorder = "thin " + gridModel.gridlinestyle + " #" + gridModel.gridlinecolor.substr(0, 6);
        },

        create: function(gridModel, context) {
            var rowdata = gridModel.data || (IndexJL ? [null] : []);
            var computedSkin = $KW.skins.getWidgetSkinList(gridModel, gridModel.context);
            var margin = $KW.skins.getMarginSkin(gridModel, context);

            var htmlString = "";

            
            var computedSkinArray = computedSkin.split(" ");
            if(context.isPercent == true)
                computedSkinArray[1] = "";
            computedSkin = computedSkinArray.join(" ");

            var htmlString = "<table style='border-collapse:collapse;table-layout:fixed;" + margin + "' class='" + computedSkin + "' " + $KW.Utils.getBaseHtml(gridModel, gridModel.context) + ">";
            var columnModel = gridModel.columnheadersconfig;
            if(columnModel) {

                var header = this.headerBuilder(columnModel, gridModel);
                htmlString += this.appendRowTag(gridModel, header, true);

                var body = this.createBody(gridModel, rowdata);
                htmlString += this.appendRowTag(gridModel, body || [], false, 1, true, true);
            }
            htmlString += "</table>";
            return htmlString;
        },

        
        headerBuilder: function(columnModel, gridModel) {
            gridModel.columnids = [];
            gridModel.columntype = [];
            for(var i = IndexJL; i < columnModel.length; i++) {
                gridModel.columnids.push(columnModel[i].columnid);
                gridModel.columntype.push(columnModel[i].columntype);
            }
            var padding = $KW.skins.getBaseStyle(gridModel);
            var border = "word-wrap:break-word;border:" + gridModel.cellBorder + " ; font-weight:inherit;";
            var thTmpl = "<th id='{id}' style='overflow:hidden;" + padding + border + "' width='{width}%' class='{class}' type='{type}' colno='{colno}' colindex='{colindex}'>";
            var temp = null;
            var headerStr = "";
            var headerHTML = [];
            var colInfo = "";

            for(var i = IndexJL; i < columnModel.length; i++) {
                colInfo = columnModel[i];
                var width = (colInfo.columnwidthinpercentage || 0);
                var align = colInfo.columncontentalignment || "";
                align = $KW.skins.getContentAlignment(gridModel, align);

                temp = thTmpl.replace(/\{id\}/g, colInfo.columnid);
                temp = temp.replace(/\{width\}/g, width);
                temp = temp.replace(/\{class\}/g, align);
                temp = temp.replace(/\{type\}/g, colInfo.columntype);
                temp = temp.replace(/\{colno\}/g, i);
                temp = temp.replace(/\{colindex}/g, "0," + i);
                headerStr = temp + ($KU.escapeHTMLSpecialEntities(colInfo.columnheadertext) || "") + '</th>';
                headerHTML.push(headerStr);
            }
            return headerHTML;
        },

        
        createBody: function(gridModel, rowdata) {
            var bodyrowhtmlstr;
            var padding = $KW.skins.getBaseStyle(gridModel);

            if(rowdata.length > IndexJL) {
                var border = "word-wrap:break-word;border:" + gridModel.cellBorder;
                var textTmpl = "<td id='{id}' width='{width}%' style='overflow:hidden;" + padding + border + "' class='{class}' colindex='{colindex}' >{text}</td>";
                var imgTmpl = "<td id='{id}' width='{width}%' style='overflow:hidden;" + padding + border + "' class='{class}' colindex='{colindex}'><img src={src} class='{class}' onload='$KW.DataGrid.imgLoadHandler(arguments[0],this)'></td>";
                var temp = null;
                var bodyrowhtml = [];
                var noofcolumns = 0;
                var id, colInfo = "";
                var colspan = 1;
                gridModel.counter = 1; 
                noofcolumns = gridModel.columnids.length;

                for(var i = IndexJL; i < rowdata.length; i++) {
                    bodyrowhtml[i - IndexJL] = [];
                    for(var j = 0; j < noofcolumns; j++) {
                        id = gridModel.columnids[j];
                        colInfo = gridModel.columnheadersconfig[j + IndexJL];
                        var type = gridModel.columntype[j];
                        var width = (colInfo.columnwidthinpercentage || 0);
                        var skin = "";
                        colspan = 1;
                        var cIndex = i + "," + j;

                        if(rowdata[i]["metainfo"]) {
                            skin = rowdata[i]["metainfo"][id + "_skin"];
                            skin = skin || "";
                        }
                        var align = colInfo.columncontentalignment || "";
                        align = $KW.skins.getContentAlignment(gridModel, align);
                        type = type || "text";

                        if(type == "text") {
                            var text = (rowdata[i][id] && rowdata[i][id] != null) ? rowdata[i][id] : "";
                            text = text.replace(/\$0/g, '$$$$0');
                            
                            text = text.replace(/\$_/g, '$$$$_');
                            temp = textTmpl.replace(/\{text\}/g, $KU.escapeHTMLSpecialEntities(text));
                            temp = temp.replace(/\{class\}/g, (skin + " " + align + " " + padding));
                        } else if(type == "image") {
                            var imgsrc = rowdata[i][id] && $KU.getImageURL(rowdata[i][id]);
                            temp = imgTmpl.replace(/\{src\}/g, imgsrc || "''");
                            temp = temp.replace(/\{class\}/g, align + " " + padding);
                        } else if(type == "template") {
                            var colData = rowdata[i][id];
                            if(colData["metainfo"]) {
                                if(colData["metainfo"]["colspan"]) {
                                    colspan = colData["metainfo"]["colspan"]
                                }
                            }
                            temp = "<td id='{id}' width='{width}%' style='overflow:hidden;" + padding + border + "' class='{class}' colindex='{colindex}' colspan='" + colspan + "'>";
                            temp = temp.replace(/\{class\}/g, (skin + " " + align + " " + padding));
                            var boxModel = colData.template || colInfo.columndatatemplate;
                            if(boxModel && colData) {
                                gridModel.widgetsData = colData;
                                temp += $KW.Utils.handleLayout(gridModel, boxModel, colData);
                            }
                            temp += '</td>';
                        }
                        temp = temp.replace(/\{colindex\}/g, cIndex);
                        temp = temp.replace(/\{width\}/g, width);
                        
                        temp = temp.replace(/\{id}/g, id);
                        bodyrowhtml[i - IndexJL][j] = temp;
                        j = j + (colspan - 1);
                    }
                    gridModel.counter++;
                }
            }
            return bodyrowhtml;
        },

        appendRowTag: function(gridModel, htmlArray, headerflag, index, generateTable, generateTBody) {
            var html = "";

            if(headerflag == true) {
                html += "<thead><tr index=0 " + $KW.Utils.getBaseHtml(gridModel, gridModel.context) + (gridModel.headerskin ? " class='" + gridModel.headerskin + "'" : "") + (gridModel.showcolumnheaders != "undefined" && gridModel.showcolumnheaders == false ? " style='display:none'" : "") + ">";
                for(var i = 0; i < htmlArray.length; i++) {
                    html += htmlArray[i];
                }
                html += '</tr></thead>';
            } else {
                var askin = gridModel.rowalternateskin || gridModel.alternateskin || "";
                var rskin = gridModel.rownormalskin || gridModel.skin || "";
                if(generateTBody)
                    html += "<tbody>";
                if(htmlArray) {
                    for(var i = 0; i < htmlArray.length; i++) {
                        var metaInfo = gridModel.data[i + IndexJL].metainfo;
                        var skin = (metaInfo && metaInfo.skin) || ((i % 2 != 0 && askin) ? askin : rskin);
                        if(gridModel.ismultiselect && gridModel.selectedindices) {
                            if($KU.inArray(gridModel.selectedindices, (IndexJL ? index : index - 1))[0] && gridModel.rowfocusskin)
                                skin = gridModel.rowfocusskin;
                        }
                        html += "<tr index=" + index + $KW.Utils.getBaseHtml(gridModel, gridModel.context) + (skin ? " class='" + skin + "'" : "") + ">";
                        for(var j = 0; j < gridModel.columnids.length; j++) {
                            html += htmlArray[i][j];
                        }
                        html += '</tr>';
                        index++;
                    }
                }
                if(generateTBody)
                    html += "</tbody>";
            }
            return html;
        },

        imgLoadHandler: function(event, img) {
            event = event || window.event;
            img = event.target || event.srcElement;
            var nWidth = img.naturalWidth || img.width;
            var nHeight = img.naturalHeight || img.height;
            var cell = img.parentNode;
            var padding = parseInt($KU.getStyle(cell, "padding-left").replace("px", ""), 10) + parseInt($KU.getStyle(cell, "padding-right").replace("px", ""), 10);
            var cellWidth = cell.clientWidth - padding;

            if(nWidth > cellWidth) {
                img.style.width = cellWidth + "px";
                var aspectratio = nWidth / nHeight;
                img.style.height = Math.round(1 / aspectratio * cellWidth) + "px";
            }
        },

        eventHandler: function(event, target) {
            if(!event)
                event = window.event;
            var cell = $KU.getParentByAttribute(event.target || event.srcElement, "colindex");
            var index = parseInt(target.getAttribute("index"), 10);
            var gridModel = $KU.getModelByNode(target);
            (index > 0) && module.setFocusedIndex(gridModel, target, cell, index);
            module.rowClickHandler(gridModel, index, cell);
        },

        rowClickHandler: function(gridModel, index, cell) {
            var event;
            spaAPM && spaAPM.sendMsg(gridModel, 'onrowselected');
            $KAR && $KAR.sendRecording(gridModel, 'click', {'colIndex': cell.getAttribute("colindex"), 'eventType': 'uiAction'});
            if(index == 0) { 
                var colInfo = gridModel.columnheadersconfig[parseInt(cell.getAttribute("colno"), 10)];
                event = $KU.returnEventReference(colInfo.columnonclick || colInfo.columnOnClick || "");
            } else { 
                event = $KU.returnEventReference(gridModel.onrowselected);
            }
            
            event && $KU.executeWidgetEventHandler(gridModel, event);
        },


        setFocusedIndex: function(gridModel, row, column, index) {
            if(index > 0) {
                index = IndexJL ? index : index - 1;
                gridModel.selectedindex = gridModel.focusedindex = index;
                gridModel.selecteditem = gridModel.focuseditem = gridModel.data[index];
                if(!gridModel.ismultiselect) {
                    gridModel.selectedindices = IndexJL ? [null, index] : [index];
                    this.setSelectedItems(gridModel, true);
                }
                var cellindex = parseInt(column.getAttribute("colindex").split(",")[1]);
                gridModel.selectedcellindex = [cellindex, column.id];
                gridModel.selectedcellitem = gridModel.focuseditem[column.id];
            }
            gridModel.ismultiselect && this.setSelectedIndices(gridModel, row);
        },

        setSelectedIndices: function(gridModel, row) {
            if(gridModel.ismultiselect) {
                var indices = gridModel.selectedindices || (IndexJL ? [null] : []);
                var items = gridModel.selecteditems || (IndexJL ? [null] : []);
                var index = gridModel.focusedindex;
                var result = $KU.inArray(indices, index);
                if(result[0]) {
                    indices.splice(result[1], 1);
                    items.splice(result[1], 1);
                    if(gridModel.rowfocusskin) {
                        var skin = this.getRowSkin(gridModel, index);
                        row.className = skin || "";
                    }
                } else {
                    indices.push(index);
                    items.push(gridModel.data[index]);
                    gridModel.rowfocusskin && (row.className = gridModel.rowfocusskin);
                }
                gridModel.selectedindices = (indices.length > IndexJL) ? indices : null;
                gridModel.selecteditems = (items.length > IndexJL) ? items : null;
            }
        },

        setSelectedItems: function(gridModel, applyFocusSkin) {
            if(gridModel.selectedindices) {
                gridModel.selecteditems = IndexJL ? [null] : [];
                for(var i = IndexJL; i < gridModel.selectedindices.length; i++) {
                    gridModel.data && gridModel.data[gridModel.selectedindices[i]] && gridModel.selecteditems.push(gridModel.data[gridModel.selectedindices[i]]);
                }
            }
            if(applyFocusSkin) {
                var element = $KU.getNodeByModel(gridModel);
                if(element) {
                    var rows = element.tBodies[0].rows;
                    for(var i = 0; i < rows.length; i++) {
                        if((gridModel.selectedindices && $KU.inArray(gridModel.selectedindices, i + IndexJL)[0]) || (!gridModel.ismultiselect && gridModel.selectedindex == i + IndexJL))
                            rows[i].className = gridModel.rowfocusskin
                        else {
                            var skin = this.getRowSkin(gridModel, i + IndexJL);
                            rows[i].className = skin || "";
                        }
                    }
                }

            }
        },

        getRowSkin: function(gridModel, index) {
            var rowSkin = gridModel.rownormalskin || gridModel.skin || "";
            var askin = gridModel.rowalternateskin || gridModel.alternateskin || "";
            var metaInfo = gridModel.data[index]["metainfo"];
            return(metaInfo && metaInfo.skin) ? metaInfo.skin : (((parseInt(index, 10) - IndexJL) % 2 != 0 && askin) ? askin : rowSkin);
        },

        updateIndices: function(gridModel, action, index) {
            if(gridModel.data && gridModel.data.length > IndexJL) {
                var indices = gridModel.selectedindices;
                if(action == "addat") {
                    for(var i = IndexJL; i < indices.length; i++) {
                        if(indices[i] >= index)
                            indices[i] = indices[i] + 1;
                    }
                } else { 
                    var result = $KU.inArray(indices, index);
                    result[0] && indices.splice(result[1], 1);
                    for(var i = IndexJL; i < indices.length; i++) {
                        if(indices[i] >= index)
                            indices[i] = indices[i] - 1;
                    }
                }
                gridModel.selectedindices = indices.length > IndexJL ? indices : null;
                this.setSelectedItems(gridModel);
            } else {
                gridModel.selectedindices = gridModel.selecteditems = null;
            }
        },


        
        setData: function(widgetModel, dataArray) {
            widgetModel.focusedindex = widgetModel.focuseditem = widgetModel.selectedindex = widgetModel.selecteditem = widgetModel.selectedindices = widgetModel.selecteditems = null;

            $KU.isArray(dataArray) && this.modifyContent(widgetModel, dataArray, "setdata");
        },

        addAll: function(widgetModel, dataArray, key) {
            $KU.isArray(dataArray) && this.modifyContent(widgetModel, dataArray, "addall");
        },

        removeAll: function(widgetModel) {
            widgetModel.focusedindex = widgetModel.focuseditem = widgetModel.selectedindex = widgetModel.selecteditem = widgetModel.selectedindices = widgetModel.selecteditems = null;

            this.modifyContent(widgetModel, IndexJL ? [null] : [], "removeall");
        },

        removeAt: function(widgetModel, index) {
            (!isNaN(index) && index >= IndexJL) && this.modifyContent(widgetModel, [], "removeat", index);
        },

        
        setDataAt: function(widgetModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(widgetModel, dataObj, "setdataat", index);
        },

        addDataAt: function(widgetModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(widgetModel, dataObj, "addat", index);
        },

        
        setCellData: function(widgetModel, rowIndex, columnID, data) {
            (!isNaN(rowIndex) && data) && this.modifyContent(widgetModel, data, "setcelldata", rowIndex, columnID);
        },

        setHeaderCellDataAt: function(widgetModel, columnID, data) {
            (columnID && data) && this.modifyContent(widgetModel, data, "setheadercelldata", '', columnID);
        },

        applyCellSkin: function(widgetModel, rowIndex, columnID, skinID) {
            !isNaN(rowIndex) && this.modifyContent(widgetModel, skinID, "applycellskin", rowIndex, columnID);
        },

        selectAll: function(widgetModel, flag) {
            this.modifyContent(widgetModel, flag, "selectall");
        },

        setTBodyInnerHTML: function(tBody, html, action) {
            if(!$KU.isIE)
                tBody.innerHTML = html;
            else {
                
                var temp = this.createTemp();
                if(action == "setdata") {
                    temp.innerHTML = "<table>" + html + "</table>";
                    while(tBody.children.length > 0) { 
                        tBody.removeChild(tBody.children[0]);
                    }
                    while(temp.firstChild.children.length > 0) {
                        tBody.appendChild(temp.firstChild.children[0]);
                    }
                } else {
                    temp.innerHTML = "<table><tbody>" + html + "</tbody></table>";
                    if(tBody.tagName == 'TABLE') 
                        tBody.appendChild(temp.firstChild.firstChild);
                    else
                        tBody.parentNode.replaceChild(temp.firstChild.firstChild, tBody);
                }
            }
        },

        setTRInnerHTML: function(tr, html, index) {
            if(!$KU.isIE)
                tr.innerHTML = html;
            else {
                var temp = this.createTemp();
                temp.innerHTML = "<table><tbody><tr class='" + tr.className + "' index='" + index + "'>" + html + "</tr></tbody></table>";
                tr.parentNode.replaceChild(temp.firstChild.firstChild.firstChild, tr);
            }
        },

        createTemp: function() {
            var temp = document.getElementById("__temp");
            if(!temp) {
                temp = document.createElement("div");
                temp.id = "__temp";
            }
            return temp;
        },

        modifyContent: function(gridModel, dataArray, action, index, columnID) { 
            if(gridModel) {
                if(action != "setcelldata" && action != "applycellskin" && action != "selectall") {
                    gridModel.canUpdateUI = false;
                    $KW.Utils.updateContent(gridModel, "data", dataArray, action, index);
                    gridModel.canUpdateUI = true;
                }
                if(gridModel.data)
                    gridModel.rowcount = gridModel.data.length - IndexJL;

                var gridObj = $KU.getNodeByModel(gridModel);
                if(gridModel.enablescrollbar == 1 && gridModel.dockingheader)
                    gridObj = $KU.getElementById(gridModel.pf + "_" + gridModel.id + "_body").childNodes[0];

                var holder = gridObj && (gridObj.tBodies[0] || gridObj);
                if(holder) {
                    var cellIndex;
                    switch(action) {

                        case "setdata":
                            var header = this.headerBuilder(gridModel.columnheadersconfig, gridModel);
                            var innerHTML = this.appendRowTag(gridModel, header, true);
                            var body = this.createBody(gridModel, dataArray);
                            innerHTML += this.appendRowTag(gridModel, body, false, 1, false, true);
                            this.setTBodyInnerHTML(gridObj, innerHTML, "setdata");
                            break;

                        case "setdataat":
                            var dataArray = IndexJL ? [null, dataArray] : [dataArray];
                            var existingRow = holder.rows[index - IndexJL];
                            if(existingRow)
                                var innerHTML = this.createBody(gridModel, dataArray)[0].join("");
                            this.setTRInnerHTML(existingRow, innerHTML, index);
                            break;

                        case "addall":
                            var index = holder.rows.length;
                            var body = this.createBody(gridModel, dataArray);
                            var innerHTML = holder.innerHTML + this.appendRowTag(gridModel, body, false, index + 1, false, false);
                            this.setTBodyInnerHTML(holder, innerHTML);

                            if(gridModel.enablescrollbar == 1 && gridModel.dockingheader) {
                                $KU.isIE && (holder = $KU.getElementById(gridModel.pf + "_" + gridModel.id + "_body").childNodes[0]);

                                var addedRow = holder.rows[index];
                                addedRow && addedRow.scrollIntoView(true);
                            }
                            break;

                        case "addat":
                            var rIndex = (index <= IndexJL) ? 0 : (index > gridModel.rowcount ? gridModel.rowcount : index);
                            var wrapper = document.createElement("div");
                            var dataArray = IndexJL ? [null, dataArray] : [dataArray];
                            wrapper.innerHTML = "<table><tr index=" + rIndex + $KW.Utils.getBaseHtml(gridModel, {
                                tabpaneID: gridObj.getAttribute("ktabpaneid")
                            }) + "></tr></table>";
                            var innerHTML = this.createBody(gridModel, dataArray)[0].join("");
                            var newRow = wrapper.firstChild.rows[0];
                            if(index >= holder.rows.length)
                                holder.appendChild(newRow);
                            else
                                holder.insertBefore(newRow, holder.rows[index - IndexJL]);
                            this.setTRInnerHTML(newRow, innerHTML, index);
                            break;

                        case "setcelldata":
                        case "applycellskin":
                        case "setheadercelldata":
                            var result = $KU.inArray(gridModel.columnids, columnID);
                            if(result[0]) {
                                var rowData = gridModel.data[index];
                                var htmlRow = holder.rows[index - IndexJL];
                                if(htmlRow) {
                                    if(action == "setcelldata") {
                                        rowData[columnID] = dataArray;
                                        htmlRow.cells[result[1]].innerHTML = dataArray;
                                    } else {
                                        var metaInfo = rowData.metainfo || {};
                                        metaInfo[columnID + "_skin"] = dataArray;
                                        rowData.metainfo = metaInfo;
                                        htmlRow.cells[result[1]].className += " " + dataArray;
                                    }
                                }
                            }
                            break;

                        case "removeall":
                            this.setTBodyInnerHTML(holder, "");
                            break;

                        case "removeat":
                            holder.rows[index - IndexJL] && holder.removeChild(holder.rows[index - IndexJL]);
                            break;

                        case "selectall":
                            if(gridModel.ismultiselect && gridModel.data && dataArray) {
                                var indices = IndexJL ? [null] : [];
                                for(var i = IndexJL; i < gridModel.data.length; i++) {
                                    indices.push(i);
                                }
                                gridModel.selectedindices = indices;
                            }
                            if(!dataArray) {
                                gridModel.selectedindices = gridModel.selecteditems = null;

                            }
                            this.setSelectedItems(gridModel, true);
                            break;

                        default:

                    }
                    this.adjustNodeIndex(holder);
                    if(action == "addat" || action == "removeat") {
                        gridModel.ismultiselect && gridModel.selectedindices && this.updateIndices(gridModel, action, index);
                    }
                    if(action == "addat" || action == "removeat" || action == "addall")
                        this.applyRowSkin(gridModel);

                }
            }
        },

        adjustNodeIndex: function(node) { 
            var rows = node.childNodes;
            if(rows) {
                for(var i = 0; i < rows.length; i++) {
                    rows[i].setAttribute("index", i + 1);
                    cells = rows[i].cells;
                    for(var j = 0; cells && j < cells.length; j++) {
                        cells[j].setAttribute("colindex", i + "," + j);
                    }
                }
            }
        },

        addArray: function(srcArray, targetArray) {
            for(var i = 0; i < targetArray.length; i++) {
                srcArray.push(targetArray[i]);
            }
            return srcArray;
        },

        toggleVisibilty: function(model, data) {
            var node = $KU.getNodeByModel(model);
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(model);
            if(isFlexWidget)
                node = node.parentNode;
            if(data && data.length > 0 && model.isvisible) {
                node.style.display = "";
                $KU.removeClassName(node, "hide");
            } else
                node.style.display = "none";
        },

        applyRowSkin: function(gridModel) {
            var holder = $KU.getNodeByModel(gridModel);
            var rows = holder.tBodies[0].rows;
            var rowSkin = gridModel.rownormalskin || gridModel.skin || "";
            var askin = gridModel.rowalternateskin || gridModel.alternateskin || "";
            
            if(rowSkin || askin) {
                for(var i = 0; i < rows.length; i++) {
                    var metaInfo = gridModel.data[i + IndexJL]["metainfo"];
                    var skin = (metaInfo && metaInfo.skin) ? metaInfo.skin : ((i % 2 != 0 && askin) ? askin : rowSkin);
                    if(gridModel.ismultiselect && gridModel.rowfocusskin && gridModel.selectedindices && $KU.inArray(gridModel.selectedindices, i + IndexJL)[0])
                        rows[i].className = gridModel.rowfocusskin;
                    else
                        rows[i].className = skin;
                }
            }
        },

        applyCellBorder: function(widgetModel) {
            var element = $KU.getNodeByModel(widgetModel);
            widgetModel.cellBorder = "thin " + widgetModel.gridlinestyle + " #" + widgetModel.gridlinecolor.substr(0, 6);
            if(element) {
                var applyStyle = function(rows) {
                    for(var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        for(var j = 0; j < row.cells.length; j++) {
                            row.cells[j].style.border = widgetModel.cellBorder;
                        }
                    }
                }
                applyStyle(element.tHead && element.tHead.rows);

                if(widgetModel.enablescrollbar == 1 && widgetModel.dockingheader)
                    element = $KU.getElementById(widgetModel.pf + "_" + widgetModel.id + "_body").childNodes[0];

                applyStyle(element.tBodies[0].rows);
            }
        }

    };



    return module;
}());
