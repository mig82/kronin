
$KW.Calendar = (function() {
    var DD = 'dd',
        MM = 'MM',
        mm = 'mm',
        yyyy = 'yyyy',
        yy = 'yy',
        separator_ = '-',
        seperator = '/',
        cseperator = '/',
        dateformat = 'MM/dd/yyyy',
        calendarDaysValue, calendarMonthsValues, active, activeCalendarPopUp;

    
    var _addClass = function(element, className) {
        if(!_hasClass(element, className)) {
            element.className = (element.className === '') ? className : element.className + ' ' + className;
        }
    };
    var _applySkins = function(model) {
        var holdingDate, config = model.viewconfig.gridconfig || model.viewconfig.gridConfig || {},
            datesAll = model.datesGroupSimplified,
            pickerStyle = _getGridTheme(model.gridTheme),
            specialDates = model.specialDates,
            selected, element, i, dateCells, date, dates, stateOfthis = 0,
            j, k, _addClassToCell = function(element, selectedDate, holdingDate, config, selectionType) {
                var currentDate = new Date(),
                    indexOfCell = element.getAttribute('weekday') * 1,
                    selectionIndex, isRangeCalendar = (selectionType == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) ? true : false;
                if(selectedDate) {
                    selectionIndex = selectedDate.indexOf(holdingDate.setHours(0, 0, 0, 0));
                }
                _removeSelectedSkins(element, config, isRangeCalendar);
                if(selectionIndex > -1) {
                    if(pickerStyle == kony.calendar.MODERN) {
                        if(holdingDate.setHours(0, 0, 0, 0) == currentDate.setHours(0, 0, 0, 0)) {
                            _addClass(element, config.gridCellSelectedTodaySkin);
                        } else {
                            _addClass(element, config.gridCellSelectedSkin);
                        }
                    } else {
                        _addClass(element, config.gridCellSelectedSkin);
                    }
                    if(selectionType == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
                        if(selectionIndex == 0) {
                            _addClass(element, config.gridCellFromDateSkin);
                        } else if(selectionIndex == selectedDate.length - 1) {
                            _addClass(element, config.gridCellToDateSkin);
                        }
                    }
                } else if(holdingDate.setHours(0, 0, 0, 0) == currentDate.setHours(0, 0, 0, 0)) {
                    _addClass(element, config.gridCellTodaySkin);
                } else if(indexOfCell == 0 || indexOfCell == 6) { 
                    _addClass(element, config.gridCellWeekendSkin);
                } else {
                    _addClass(element, config.gridCellSkin);
                }
            },
            _convertToDateArray = function(model, dates) {
                var i, tempDate, tempDates = [];
                for(i = 0; i < dates.length; i++) {
                    tempDates[i] = (new Date(dates[i][2], dates[i][1] - 1, dates[i][0])).setHours(0, 0, 0, 0);
                }
                return tempDates;
            },
            _getStateOfDay = function(model, date) {
                var startDate, endDate, stateOfthis = 0;
                if(model.validstartdate) {
                    startDate = new Date(model.validstartdate[2], model.validstartdate[1] - 1, model.validstartdate[0]).setHours(0, 0, 0, 0);
                }
                if(model.validenddate) {
                    endDate = new Date(model.validenddate[2], model.validenddate[1] - 1, model.validenddate[0]).setHours(0, 0, 0, 0);
                }

                if((startDate && startDate !== 0) && (endDate && endDate !== 0)) {
                    if(date < startDate || date > endDate) {
                        stateOfthis = 1;
                    }
                } else if(!startDate && endDate) {
                    if(date > endDate) {
                        stateOfthis = 1;
                    }
                } else if(!endDate && startDate) {
                    if(date < startDate) {
                        stateOfthis = 1;
                    }
                }
                return stateOfthis;
            },
            _removeSelectedSkins = function(element, config, isRangeCalendar) {
                _removeClass(element, config.gridCellSkin);
                _removeClass(element, config.gridCellSelectedSkin);
                _removeClass(element, config.gridCellWeekendSkin);
                pickerStyle == kony.calendar.MODERN && _removeClass(element, config.gridCellSelectedTodaySkin);
                if(isRangeCalendar) {
                    _removeClass(element, config.gridCellFromDateSkin);
                    _removeClass(element, config.gridCellToDateSkin);
                }
            },
            _setRowSkin = function(skinName) {
                element.setAttribute("kwidgettype", "DisabledCal");
                element.className = skinName;
                element.removeAttribute('kwidgettype');
                element.removeAttribute('k-w-c-hold-day');
            };
        dateCells = document.querySelectorAll('#' + module.active + ' [k-w-c-hold-day]');
        if(module.isMultiRangeCalendar(model)) {
            selected = _convertToDateArray(model, model.displayDates);
        } else {
            if(model.day != 0) {
                selected = [(new Date(model.year, model.month - 1, model.day)).setHours(0, 0, 0, 0)];
            }
        }
        for(i = 0; i < dateCells.length; i++) {
            holdingDate = dateCells[i].getAttribute('k-w-c-hold-day').split(',');
            element = dateCells[i];
            holdingDate = new Date(holdingDate[2], holdingDate[1] - 1, holdingDate[0]);
            _addClassToCell(element, selected, holdingDate, config, model.selectiontype);
            date = holdingDate.setHours(0, 0, 0, 0);
            stateOfthis = _getStateOfDay(model, date);
            if(stateOfthis == 1) {
                _setRowSkin(config.gridCellInactiveDaysSkin);
            }
            if(datesAll) { 
                if(model.datesState == 0 && datesAll.length > 0 && datesAll.indexOf(date) > -1) {
                    _setRowSkin(config.gridCellInactiveDaysSkin);
                }
                if(model.datesState == 1 && datesAll.length > 0) {
                    if(datesAll.indexOf(date) <= -1) {
                        stateOfthis = 1;
                        _setRowSkin(config.gridCellInactiveDaysSkin);
                    } else {
                        _removeClass(element, config.gridCellWeekendSkin);
                        _removeClass(element, config.gridCellSkin);
                        if(!_hasClass(element, config.gridCellSelectedSkin) &&
                            !_hasClass(element, config.gridCellTodaySkin) &&
                            (pickerStyle != kony.calendar.MODERN || !_hasClass(element, config.gridCellSelectedTodaySkin))) {
                            _addClass(element, model.datesGroupSkin);
                        }
                    }
                }
            }
            
            if(specialDates) { 
                date = element.getAttribute('k-w-c-hold-day').split(',');
                for(k in specialDates) {
                    dates = model.specialDates[k];
                    if(dates) {
                        for(j = 0; j < dates.length; j++) {
                            if(dates[j]) {
                                dateNN = new Date(dates[j][2], dates[j][1] - 1, dates[j][0]).setHours(0, 0, 0, 0);
                                if(new Date(date[2], date[1] - 1, date[0]).setHours(0, 0, 0, 0) == dateNN) {
                                    _removeClass(element, config.gridCellWeekendSkin);
                                    _removeClass(element, config.gridCellSkin);
                                    _removeClass(element, model.datesGroupSkin);
                                    if(!_hasClass(element, config.gridCellSelectedSkin) &&
                                        !_hasClass(element, config.gridCellTodaySkin) &&
                                        (pickerStyle != kony.calendar.MODERN || !_hasClass(element, config.gridCellSelectedTodaySkin))) {
                                        _addClass(element, k);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    var _between = function(from, to) {
        var addDays = function(inpD, days) {
                var date = new Date(inpD.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            },
            dateArray = new Array(),
            currentDate = from;
        while(currentDate <= to) {
            dateArray.push(new Date(currentDate).setHours(0, 0, 0, 0));
            currentDate = addDays(currentDate, 1);
        }
        return dateArray;
    };
    var _chunks = function(array, size) {
        var results = [];
        while(array.length) {
            results.push(array.splice(0, size));
        }
        return results;
    };
    
    var _convertToModelDate = function(date, dateFormat) {
        var formattedDateArray = null,
            dateArray = null,
            modelDate = new Array(),
            dateObj = {},
            dayIndex = 0 
            ,
            monthIndex = 1,
            yearValue;

        if(dateFormat != null && date) {

            formattedDateArray = dateFormat.split(seperator);
            if(date instanceof Array) {
                dateArray = date;
            } else {
                dateArray = date.split(seperator);
            }
            yearValue = dateArray[2];
            if(formattedDateArray[0] !== "dd") {
                monthIndex = 0;
                dayIndex = 1;
                if(formattedDateArray[2] !== "yyyy" || formattedDateArray[2].length > 3) {
                    
                    yearValue = dateArray[2].substring(2, 4);
                }
            }

            modelDate[dayIndex] = dateArray[0];
            dateObj.day = dateArray[0];

            modelDate[monthIndex] = dateArray[1];
            dateObj.month = dateArray[1];

            modelDate[2] = yearValue;
            dateObj.year = dateArray[2];
        }

        dateObj.date = modelDate;
        dateObj.dateText = modelDate[0] + seperator + modelDate[1] + seperator + modelDate[2];
        dateObj.selectdate = dateObj.month + seperator + dateObj.day + seperator + dateObj.year; 
        dateObj.pagedate = dateObj.month + seperator + dateObj.year; 

        return dateObj;
    };
    var _dateFormatter = function(format, date, check, inputYear) {
        var trim = function(str) {
                return str.replace(/ +(?= )/g, '').replace(/^\s+|\s+$/g, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+(?=_)/g, '').split('_');
            },
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            DayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            day, month, dummyDate, dateObj, dateObject, ob, year, obj = {},
            fmt, mm, mmm, mmmm, yy, yyyy, dd, ddd, dddd, doo, i;
        if(check && format) {
            check = trim(check);
            fmt = trim(format.toLowerCase());
            if(fmt.length != check.length) {
                return false;
            }
            for(m = 0, n = fmt.length; m < n; m++) {
                obj[fmt[m]] = check[m];
            }
            for(i in obj) {
                if(obj.hasOwnProperty(i)) {
                    switch(i) {
                        case "mmm":
                            month = monthsS.indexOf(obj[i]) + 1;
                            if(month == 0) return false;
                            break;
                        case "mmmm":
                            month = months.indexOf(obj[i]) + 1;
                            if(month == 0) return false;
                            break;
                        case "mm":
                            month = obj[i] * 1;
                            if(month < 1 || month > 12) return false;
                            break;
                        case "dd":
                            day = obj[i] * 1;
                            if(day <= 0) return false;
                            break;
                        case "do":
                            day = parseInt(obj[i], 10);
                            if(day <= 0) return false;
                            break;
                        case "yy":
                        case "yyyy":
                            if(obj[i] != "") {
                                year = ("" + obj[i]).length > 2 ? (obj[i] * 1) : (obj[i] * 1 + ((Math.floor(inputYear / 100) * 100) || 2000));
                            } else {
                                year = ("" + obj[i]).length > 2 ? (obj[i] * 1) : (obj[i] * 1 + (new Date().getFullYear()));
                            }
                            if(year > 2099 || year < 1900) return false;
                            break;
                    }
                }
            }
            dummyDate = 1;
            dateObject = new Date(year, month - 1, day || dummyDate);
            if(Object.prototype.toString.call(dateObject) === "[object Date]") {
                if((dateObject.getFullYear() == year) && (dateObject.getMonth() + 1 == month) && (dateObject.getDate() == (day || dummyDate))) {
                    date = [day || dummyDate, month, year];
                } else {
                    return false;
                }
            }
        } else if(date) {
            try {
                for(ob = 0; ob < 3; ob++) {
                    date[ob] = +date[ob];
                }
            } catch(e) {
                kony.web.logger("error", e);
            }
        }

        if(!format || !date) return false;
        format = '' + format.toLowerCase().replace(/ +(?= )/g, '').replace(/^\s+|\s+$/g, '');
        dateObj = new Date(date[2], date[1] - 1, date[0]);
        mm = date[1] <= 9 ? "0" + date[1].toString() : date[1];
        mmm = monthsS[date[1] - 1];
        mmmm = months[date[1] - 1];
        yy = (date[2] + "").substring(2, 4);
        yyyy = date[2];
        dd = (date[0] >= 1 && date[0] < 10 ? "0" + date[0].toString() : date[0]);
        ddd = days[dateObj.getDay()];
        dddd = DayNames[dateObj.getDay()];
        doo = date[0] + ((date[0] <= 20) && date[0] >= 10 ? "th" : ["st", "nd", "rd"][(date[0] % 10) - 1] || "th");
        return {
            date: date,
            string: format.replace('dddd', dddd).replace('mmmm', mmmm).replace('mmm', mmm).replace('mm', mm).replace('ddd', ddd).replace('dd', dd).replace('yyyy', yyyy).replace('yy', yy).replace('do', doo)
        }
    };
    var _dayTextAlignmentInCell = function(value) {
        
        var style = {};
        value = value.toLowerCase().split('_');
        style["vertical-align"] = (value[2] && value[2] == "center" ? "middle" : value[2]) || "middle";
        style["text-align"] = value[3] || "center";
        return style;
    };
    var _eventDateSelectedMultiSelect = function(calendarModel, target, result, applyLink) {
        var index, selectedDate;
        if(result != false) {
            selectedDate = module.setTimeInDateComponents([result.date.slice(0)])[0];
            index = $KU.inArray(calendarModel.displayDates, selectedDate);
            if(index[0]) {
                calendarModel.displayDates.splice(index[1], 1);
            } else {
                calendarModel.displayDates.push(selectedDate);
            }
            if(calendarModel.displayDates.length > 0) {
                applyLink.style.visibility = 'visible';
            } else {
                applyLink.style.visibility = 'hidden';
            }
            _applySkins(calendarModel);
        }
    };
    var _eventDateSelectedRangeSelect = function(calendarModel, target, result, applyLink) {
        var datesLength, tempDateObj, index, selectedDate;
        if(result != false) {
            selectedDate = module.setTimeInDateComponents([result.date.slice(0)])[0];
            datesLength = calendarModel.displayDates.length;
            index = $KU.inArray(calendarModel.displayDates, selectedDate);
            if(datesLength == 1 && !index[0]) {
                calendarModel.displayDates = _getDatesInRange(calendarModel, [calendarModel.displayDates[0], selectedDate]);
                applyLink.style.visibility = 'visible';
            } else {
                calendarModel.displayDates = [selectedDate];
                applyLink.style.visibility = 'hidden';
            }
            _applySkins(calendarModel);
        }
    };
    var _eventDateSelectedSingleSelect = function(calendarModel, target, result) {
        var calendarElement = module.activeCalendarNode,
            calendarInputField, a11yCalendarUpdate, currentDate = new Date(),
            formElement, calenEventref, containerID = calendarElement.getAttribute("kcontainerID");
        calendarElement.className = calendarElement.className.replace('konyplaceholder', "");
        if(result != false) {
            calendarModel.dateComponents = result.date;
            if(calendarElement) {
                calendarInputField = calendarElement.childNodes[0];
                calendarInputField.value = result.string;
                $KU.removeClassName(calendarInputField, 'konyplaceholder');
            }
        }
        if(containerID) {
            calendarModel.datecomponents = calendarModel.date = result.date.slice(0, 3);
        }

        $KAR && $KAR.sendRecording(calendarModel, 'selectDate', {'selection': result.date.slice(0, 3), 'target': calendarElement, 'eventType': 'uiAction'});
        calendarModel._startG = [0, calendarModel.datecomponents[1], calendarModel.datecomponents[2]];
        calendarModel.month = calendarModel.datecomponents[1];
        calendarModel.day = calendarModel.datecomponents[0];
        calendarModel.year = calendarModel.datecomponents[2];
        calendarModel.minutes = currentDate.getMinutes();
        calendarModel.hour = currentDate.getHours();
        calendarModel.seconds = currentDate.getSeconds();
        spaAPM && spaAPM.sendMsg(calendarModel, 'onselection');
        if(calendarModel.accessibilityconfig) {
            a11yCalendarUpdate = calendarModel.accessibilityconfig.a11yLabel ? calendarModel.accessibilityconfig.a11yLabel : "";
            a11yCalendarUpdate += ' ' + calendarModel.date;
        } else {
            a11yCalendarUpdate = "Calendar " + calendarModel.date;
        }
        calendarElement.setAttribute('aria-label', a11yCalendarUpdate);
        formElement = document.getElementById(calendarModel.pf);
        if(formElement) {
            formElement.setAttribute('aria-hidden', false);
        }
        module.destroyCalendar(undefined, calendarElement.id);
        calenEventref = $KU.returnEventReference(calendarModel.onselection);
        $KU.callTargetEventHandler(calendarModel, calendarElement, 'onselection');
        calenEventref && $KU.onEventHandler(calendarModel);
        calendarElement.focus();
    };
    var _eventHandler = function(eventObject, target) {
        var maxYearLimit = 2099,
            minYearLimit = 1900,
            date = {},
            series, flag, calendarId, calendarModel, calendarNode, containerId, config, endDate, startDate, title, temp, closeLink = document.getElementById('calendar-close-link'),
            applyLink = document.getElementById('calendar-apply-link'),
            titleOnPopUpVisibility = document.getElementById('-k-w-c-cal-title'),
            calendarConfig, _getCalendarRootNode = function(targetNode) {
                if(targetNode.tagName === 'INPUT' || targetNode.tagName === 'IMG') {
                    targetNode = targetNode.parentNode;
                }
                return targetNode;
            };

        if(!module.activeCalendarNode) {
            module.activeCalendarNode = _getCalendarRootNode(target);
        }
        calendarNode = module.activeCalendarNode;
        if(closeLink != null || closeLink != undefined) {
            closeLink.style.visibility = 'visible';
        }
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'visible';
        }
        calendarId = module.activeCalendarNode.getAttribute("id");
        containerId = module.activeCalendarNode.getAttribute("kcontainerid");
        calendarModel = _getCalendarModelFormCalendarNode(module.activeCalendarNode, containerId);
        title = calendarModel.title;
        if(!calendarModel.viewconfig) {
            calendarModel.viewconfig = {
                gridconfig: {}
            };
        }
        startDate = calendarModel.validstartdate;
        endDate = calendarModel.validenddate;
        calendarConfig = calendarModel.viewconfig.gridconfig || calendarModel.viewconfig.gridConfig || {};


        if(!calendarModel) return;
        if(target.className.indexOf('-kony-w-c-yemo') > -1) {
            _eventHandlerSaveCurrentSelection(calendarModel, target);
            return _eventHandlerYemoSelected(calendarModel, target, closeLink, titleOnPopUpVisibility);
        } else if(target.className.indexOf('-kony-w-c-next-nav') > -1) {
            return _eventHandlerGoToNextMonth(calendarModel, target, maxYearLimit);
        } else if(target.className.indexOf('-kony-w-c-prev-nav') > -1) {
            return _eventHandlerGoToPreviousMonth(calendarModel, target, minYearLimit);
        } else if(target.getAttribute('k-w-c-hold-day')) {
            return _eventHandlerSelectedHoldDay(calendarModel, target, applyLink);
        } else if(target.className.indexOf('-kony-w-c-navigator-month') > -1) {
            return _eventHandlerMonthSelected(calendarModel, target, closeLink, titleOnPopUpVisibility);
        } else if(target.className.indexOf('-kony-w-c-navigator-year') > -1) {
            return _eventHandlerYearSelected(target, closeLink, titleOnPopUpVisibility);
        } else if(target.className.indexOf("-kony-w-c-cancel-nav") > -1) {
            return _eventHandlerCancelSelected(target, closeLink, titleOnPopUpVisibility);
        } else if(target.className.indexOf(calendarConfig.doneButtonSkin) > -1) {
            return _eventHandlerApplySelected(calendarModel, target);
        } else if(target.className.indexOf("-kony-w-c-go-nav") > -1) {
            return _eventHandlerOkSelected(calendarModel, closeLink, titleOnPopUpVisibility);
        } else if(target.className.indexOf("-kony-w-c-left-ym-p") > -1) {
            return _eventHandlerYearLeftArrowSelected(closeLink, titleOnPopUpVisibility, minYearLimit);
        } else if(target.className.indexOf("-kony-w-c-right-ym-p") > -1) {
            return _eventHandlerYearRightArrowSelected(closeLink, titleOnPopUpVisibility, maxYearLimit);
        } else if(target.className.indexOf(calendarConfig.cancelButtonSkin) > -1) {
            return _eventHandlerCloseSelected(calendarModel);
        } else if(calendarId === calendarModel.id) {
            return false; 
        }
        _reAssignData(calendarModel); 
        if(module.isMultiRangeCalendar(calendarModel)) {
            temp = calendarModel.selectedDates || [];
            if(temp.length > 0) {
                date = {
                    "yyyy": temp[0][2],
                    "mm": temp[0][1]
                };
                if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_MULTI_SELECT) {
                    calendarModel.displayDates = temp.slice(0);
                } else {
                    calendarModel.displayDates = _getDatesInRange(calendarModel, temp);
                }
            } else {
                temp = new Date();
                date.yyyy = temp.getFullYear();
                date.mm = temp.getMonth() + 1;
                calendarModel.displayDates = [];
            }
            if(date) {
                series = _series(date.yyyy, date.mm, calendarModel.noOfMonths);
                flag = true;
            }

        }
        module.destroyCalendar(null, null, target);
        module.activeCalendarNode = calendarNode;
        _show(calendarModel, target, series, flag);
        if(calendarModel.displayDates && calendarModel.displayDates.length > 0) {
            applyLink = document.getElementById('calendar-apply-link')
            applyLink.style.visibility = 'visible';
        }
        _eventHandlerSetFocus(target);
    };
    var _eventHandlerApplySelected = function(calendarModel, target, titleOnPopUpVisibility) {
        var calendarElement = module.activeCalendarNode,
            formElement, a11yCalendarUpdate, containerID = calendarElement.getAttribute("kcontainerID"),
            displayDates = calendarModel.displayDates,
            formattedDate = "",
            formElement, a11yCalendarUpdate;
        if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_MULTI_SELECT) {
            calendarModel.selectedDates = displayDates.length > 0 ? displayDates.slice(0) : [];
        } else if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
            if(displayDates.length >= 2) {
                calendarModel.selectedDates = [
                    displayDates[0],
                    displayDates[displayDates.length - 1]
                ];
            } else {
                calendarModel.selectedDates = [];
            }
        }
        calendarModel.displayDates = [];
        if(containerID) {
            calendarModel.selecteddates = module.setTimeInDateComponents(calendarModel.selectedDates);
        }
        formattedDate = _getDisplayDate(calendarModel);
        calendarElement.childNodes[0].value = formattedDate;
        calendarModel.formatteddate = formattedDate;
        if(calendarModel.accessibilityconfig) {
            a11yCalendarUpdate = calendarModel.accessibilityconfig.a11yLabel ? calendarModel.accessibilityconfig.a11yLabel : "";
            a11yCalendarUpdate += ' ' + formattedDate;
        } else {
            a11yCalendarUpdate = "Calendar " + formattedDate;
        }
        calendarElement.setAttribute('aria-label', a11yCalendarUpdate);
        formElement = document.getElementById(calendarModel.pf);
        if(formElement) {
            formElement.setAttribute('aria-hidden', false);
        }
        spaAPM && spaAPM.sendMsg(calendarModel, 'onselection');
        module.destroyCalendar(undefined, calendarElement.id);
        calenEventref = $KU.returnEventReference(calendarModel.onselection);
        $KU.callTargetEventHandler(calendarModel, calendarElement, 'onselection');
        calenEventref && $KU.onEventHandler(calendarModel);
        calendarElement.focus();
    };
    var _eventHandlerCancelSelected = function(target, closeLink, titleOnPopUpVisibility) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            monthElement = document.querySelector("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-month-selected"),
            yearElement = document.querySelector("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-year-selected"),
            selym, element;

        monthElement && _removeClass(monthElement, '-kony-w-c-navigator-month-selected'); 
        yearElement && _removeClass(yearElement, '-kony-w-c-navigator-year-selected'); 
        if(monthElement || yearElement) {
            closeLink.style.visibility = "hidden";
            if(titleOnPopUpVisibility) {
                titleOnPopUpVisibility.style.visibility = 'hidden';
            }
            selym = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-k-w-c-nav-selected-ym")[0];
            selym.innerHTML = "";
        } else {
            element = document.getElementById(calID + "-k-w-c-navigator-scrim");
            element.parentNode.removeChild(element);
            _removeTabIndexs();
            document.activeElement.blur();
            document.querySelectorAll('.-kony-w-c-popup-container')[0].setAttribute('aria-hidden', false);
            _eventHandlerSetFocus(undefined, true);
        }
        return false;
    };
    var _eventHandlerCloseSelected = function(calendarModel) {
        var targetCalendarId = module.activeCalendarNode.getAttribute('id'),
            element = document.getElementById(targetCalendarId + "-k-w-c-datepicker"),
            calendarElement = module.activeCalendarNode,
            formElement;
        if(calendarElement) {
            calendarElement = calendarElement.childNodes[0];
            if(calendarElement.value == "") {
                module.clear(calendarModel);
            }
        }
        element.parentNode.removeChild(element);
        formElement = document.getElementById(calendarModel.pf);
        if(formElement != null) {
            formElement.setAttribute('aria-hidden', false);
        }
        module.destroyCalendar(undefined, calendarElement.id);
        calendarModel.displayDates = [];
        return;
    };
    var _eventHandlerGoToNextMonth = function(calendarModel, target, maxYearLimit) {
        var activeDP = document.getElementById(module.activeCalendarNode.getAttribute('id') + "-k-w-c-datepicker"),
            div = document.querySelectorAll("#" + activeDP.id + ' .-kony-w-c-popup-container')[0],
            month = div.getAttribute('month'),
            year = div.getAttribute('year'),
            series;
        if(Number(year) < maxYearLimit) {
            series = _series(year, month, (calendarModel.noofmonths || 1) * 1 + 1);
            series.splice(0, 1);
        } else if(Number(year) == maxYearLimit) {
            if(Number(month) < 12) {
                series = _series(year, month, (calendarModel.noofmonths || 1) * 1 + 1);
                series.splice(0, 1);
            } else {
                return;
            }
        }
        _show(calendarModel, module.activeCalendarNode, series);
        _eventHandlerSetFocus(module.activeCalendarNode);
        return;
    };
    var _eventHandlerGoToPreviousMonth = function(calendarModel, target, minYearLimit) {
        var activeDP = document.getElementById(module.activeCalendarNode.getAttribute('id') + "-k-w-c-datepicker"),
            div = document.querySelectorAll("#" + activeDP.id + ' .-kony-w-c-popup-container')[0],
            month = div.getAttribute('month'),
            year = div.getAttribute('year'),
            series;
        if(month == 1) {
            month = 12;
            year = year - 1;
        } else {
            month = month - 1;
        }
        if(Number(year) > minYearLimit) {
            series = _series(year, month, (calendarModel.noofmonths || 1));
        } else if(Number(year) == minYearLimit) {
            if(Number(month) > 0) {
                series = _series(year, month, (calendarModel.noofmonths || 1));
            }
        } else {
            return;
        }
        _show(calendarModel, module.activeCalendarNode, series);
        _eventHandlerSetFocus(module.activeCalendarNode);
        return;
    };
    var _eventHandlerMonthSelected = function(calendarModel, target, closeLink, titleOnPopUpVisibility) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            elements = document.querySelectorAll("#" + calID + "-k-w-c-datepicker  .-kony-w-c-navigator-month-selected"),
            selectedMnth, selectedym, selectedYear, year, month, i;
        closeLink.style.visibility = "hidden";
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'hidden';
        }
        for(i = 0; i < elements.length; i++) {
            if(elements[i] != target) {
                _removeClass(elements[i], '-kony-w-c-navigator-month-selected');
                _addClass(elements[i], '-kony-w-c-navigator-month');
            }
        }
        _addClass(target, '-kony-w-c-navigator-month-selected');
        selectedym = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-k-w-c-nav-selected-ym")[0];
        selectedYear = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-year-selected")[0];
        if(selectedYear) {
            year = selectedYear.getAttribute('k-w-c-hold') * 1;
        }
        selectedMnth = document.querySelectorAll("#" + calID + "-k-w-c-datepicker  .-kony-w-c-navigator-month-selected")[0];
        if(selectedMnth) {
            month = calendarMonthsValues[(selectedMnth.getAttribute('k-w-c-hold') * 1) - 1];
        }
        selectedym.innerHTML = (year || "") + " " + (month || "");
        return false;
    };
    var _eventHandlerOkSelected = function(calendarModel, closeLink, titleOnPopUpVisibility) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            selectedYear = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-year-selected")[0],
            selectedMnth, element, num, mn, x, y, _hideLnks = function(calendarModel, closeLink, titleOnPopUpVisibility) {
                closeLink.style.visibility = "hidden";
                if(titleOnPopUpVisibility) {
                    titleOnPopUpVisibility.style.visibility = 'hidden';
                }
                alert(calendarModel.navigatorAlert);
            };
        if(selectedYear) {
            x = selectedYear.getAttribute('k-w-c-hold') * 1;
        }
        selectedMnth = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-month-selected")[0];
        if(selectedMnth) {
            y = selectedMnth.getAttribute('k-w-c-hold') * 1;
        }
        num = x ? x : calendarModel.currentSelectedyearMonth[1].trim();
        mn = y ? y : calendarModel.currentSelectedMonth + 1;

        if(mn > 0 && !(mn >= 1 && mn <= 12)) {
            _hideLnks(calendarModel, closeLink, titleOnPopUpVisibility);
            return false;
        }
        number = parseInt(num, 10);
        if(num || mn) {
            element = document.getElementById(calID + "-k-w-c-navigator-scrim");
            element.parentNode.removeChild(element);
            series = _series((num || model.year || new Date().getFullYear()), (mn || calendarModel.month || new Date().getMonth() + 1), (calendarModel.noofmonths || 1) * 1 + 1);
            _show(calendarModel, module.activeCalendarNode, series);
        } else {
            _hideLnks(calendarModel, closeLink, titleOnPopUpVisibility);
            return false;
        }
        _removeTabIndexs();
        document.activeElement.blur();
        document.querySelectorAll('.-kony-w-c-popup-container')[0].setAttribute('aria-hidden', false);
        _eventHandlerSetFocus(undefined, true);
        return false;
    };
    var _eventHandlerSaveCurrentSelection = function(calendarModel, target) {
        var counter;
        calendarModel.currentSelectedyearMonth = target.innerHTML.split(',');
        for(counter = 0; counter < calendarMonthsValues.length; counter++) {
            if(calendarModel.currentSelectedyearMonth[0] == calendarMonthsValues[counter]) {
                calendarModel.currentSelectedMonth = counter;
                break;
            }
        }
    };
    var _eventHandlerSelectedHoldDay = function(calendarModel, target, applyLink) {
        var result;
        result = _dateFormatter(calendarModel.dateformat, target.getAttribute("k-w-c-hold-day").split(','));
        if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
            _eventDateSelectedRangeSelect(calendarModel, target, result, applyLink);
        } else if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_MULTI_SELECT) {
            _eventDateSelectedMultiSelect(calendarModel, target, result, applyLink);
        } else {
            _eventDateSelectedSingleSelect(calendarModel, target, result);
        }
    };
    var _eventHandlerSetFocus = function(target, setAttribute) {
        var monthYearDiv;
        target && target.blur();
        monthYearDiv = document.querySelector('.-kony-w-c-yemo');
        if(monthYearDiv) {
            setAttribute && monthYearDiv.setAttribute('tabindex', 1);
            monthYearDiv.focus();
        }
    };
    var _eventHandlerYearRightArrowSelected = function(closeLink, titleOnPopUpVisibility, maxYearLimit) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            elements = document.querySelectorAll('#' + calID + '-k-w-c-navigator-scrim .-kony-w-c-navigator-year'),
            i, yy, empty;
        closeLink.style.visibility = "hidden";
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'hidden';
        }
        for(i = 0; i < elements.length; i++) {
            if(elements[i].innerHTML == "" && this.cellVisibility == false) {
                elements[i].style.visibility = "visible";
                if((elements[i - 1] != undefined) && elements[i - 1].innerHTML != "") {
                    elements[i].innerHTML = (Number(elements[i - 1].innerHTML) + 1);
                    elements[i].setAttribute("k-w-c-hold", (Number(elements[i].innerHTML)));

                } else {
                    elements[i].innerHTML = (Number(elements[elements.length - 1].innerHTML) + 1);
                    elements[i].setAttribute("k-w-c-hold", (Number(elements[elements.length - 1].innerHTML) + 1));
                }
                _removeClass(elements[i], '-kony-w-c-navigator-year-selected');

            } else {
                yy = elements[i].getAttribute('k-w-c-hold') * 1;
                if(yy + 16 <= maxYearLimit) {
                    elements[i].innerHTML = yy + 16;
                    elements[i].setAttribute("k-w-c-hold", (yy + 16));
                    if(Number(elements[i].innerHTML) == maxYearLimit) {
                        for(empty = i + 1; empty < 16; empty++) {
                            elements[empty].innerHTML = "";
                            elements[empty].style.visibility = "hidden";
                        }
                    } else {
                        elements[i].style.visibility = "visible";
                        this.cellVisibility = true;
                        elements[i].setAttribute("k-w-c-hold", (yy + 16));
                        _removeClass(elements[i], '-kony-w-c-navigator-year-selected');
                    }
                }
            }
        }
        return false;
    };
    var _eventHandlerYearLeftArrowSelected = function(closeLink, titleOnPopUpVisibility, minYearLimit) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            elements = document.querySelectorAll('#' + calID + '-k-w-c-navigator-scrim .-kony-w-c-navigator-year'),
            yy, empty, i;
        closeLink.style.visibility = "hidden";
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'hidden';
        }
        for(i = 0; i < elements.length; i++) {
            if(elements[elements.length - 1].innerHTML == "") {
                elements[i].style.visibility = "visible";
                this.cellVisibility = true;
                if((elements[i - 1] != undefined) && elements[i - 1].innerHTML != "") {
                    elements[i].innerHTML = (Number(elements[i - 1].innerHTML) + 1);
                    elements[i].setAttribute("k-w-c-hold", (Number(elements[i].innerHTML)));
                } else {
                    elements[i].innerHTML = (Number(elements[i].innerHTML) - 16);
                    elements[i].setAttribute("k-w-c-hold", (Number(elements[i].innerHTML)));
                }
                _removeClass(elements[i], '-kony-w-c-navigator-year-selected');

            } else {
                yy = elements[i].getAttribute('k-w-c-hold') * 1;
                if(yy - 16 >= minYearLimit) {
                    elements[i].innerHTML = yy - 16;
                    elements[i].setAttribute("k-w-c-hold", (yy - 16));
                    if(yy - minYearLimit <= 16) {
                        for(empty = i - 1; empty >= 0; empty--) {
                            elements[empty].innerHTML = "";
                            elements[empty].style.visibility = "hidden";
                            this.cellVisibility = false;
                        }
                    } else {
                        elements[i].style.visibility = "visible";
                        elements[i].setAttribute("k-w-c-hold", (yy - 16));
                        _removeClass(elements[i], '-kony-w-c-navigator-year-selected');
                    }
                }
            }

        }
        return false;
    };
    var _eventHandlerYearSelected = function(target, closeLink, titleOnPopUpVisibility) {
        var calID = module.activeCalendarNode.getAttribute('id'),
            elements = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-year-selected"),
            i, selym, selectedYear, selectedMnth, x, y;
        closeLink.style.visibility = "hidden";
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'hidden';
        }
        for(i = 0; i < elements.length; i++) {
            if(elements[i] != target) {
                _removeClass(elements[i], '-kony-w-c-navigator-year-selected');
                _addClass(elements[i], '-kony-w-c-navigator-year');
            }
        }
        _addClass(target, '-kony-w-c-navigator-year-selected');
        selym = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-k-w-c-nav-selected-ym")[0];
        selectedYear = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-year-selected")[0];
        if(selectedYear) {
            x = selectedYear.getAttribute('k-w-c-hold') * 1;
        }
        selectedMnth = document.querySelectorAll("#" + calID + "-k-w-c-datepicker .-kony-w-c-navigator-month-selected")[0];
        if(selectedMnth) {
            y = calendarMonthsValues[(selectedMnth.getAttribute('k-w-c-hold') * 1) - 1];
        }
        selym.innerHTML = (y || "") + " " + (x || "");
        return false;
    };
    var _eventHandlerYemoSelected = function(calendarModel, target, closeLink, titleOnPopUpVisibility) {
        var div = document.createElement('div'),
            calID = module.activeCalendarNode.getAttribute('id'),
            element = document.getElementById(calID + '-k-w-c-datepicker'),
            template, yearMonthValue, currentYearValue;
        closeLink.style.visibility = 'hidden';
        if(titleOnPopUpVisibility) {
            titleOnPopUpVisibility.style.visibility = 'hidden';
        }
        if(target.innerText == undefined) {
            yearMonthValue = target.textContent.split(',');
        } else {
            yearMonthValue = target.innerText.split(',');
        }
        currentYearValue = yearMonthValue[1].trim();
        template = _navigatorTemplate(calendarModel, module.activeCalendarNode, currentYearValue);
        div.innerHTML = template;
        div.style.position = "absolute";
        div.style.height = div.style.width = "100%";
        div.className = "-k-w-c-navigator-scrim";
        div.style['background-color'] = "White";
        div.id = calID + "-k-w-c-navigator-scrim";
        div.setAttribute('w-type', "Calendar");
        div.firstChild.position = "absolute";
        div.firstChild.style['background-color'] = "white";
        element.appendChild(div);
        var ht = div.clientHeight,
            htp = div.firstChild.clientHeight,
            wt = div.clientWidth,
            wtp = div.firstChild.clientWidth;
        div.firstChild.position = "absolute";
        div.firstChild.style.top = ((ht - htp) / 2) + "px";
        div.firstChild.style.left = ((wt - wtp) / 2) + "px";
        div.style.top = div.style.left = "0px";
        _removeTabIndexs();
        document.activeElement.blur();
        document.querySelectorAll('.-kony-w-c-popup-container')[0].setAttribute('aria-hidden', true);
        div.querySelectorAll('[w-type-inactive]')[0].setAttribute('tabindex', 1);
        div.querySelectorAll('[w-type-inactive]')[0].focus();
        return false;
    };
    var _isValidDateComponents = function(calendarModel) {
        var isValid;
        if(module.isMultiRangeCalendar(calendarModel)) {
            isValid = module.isSelectedDatesValid(calendarModel, calendarModel.selecteddates);
        } else {
            isValid = module.isSelectedDatesValid(calendarModel, [calendarModel.datecomponents]);
        }
        return isValid;
    };
    var _generateCalendarTemplate = function(calendarModel, popupHeight, popupWidth) {
        var widgetContext = " kformname='" + calendarModel.pf + "'",
            counter, template = "",
            tempString = "",
            previousMonthI18Text = ($KG["i18nArray"] && $KG["i18nArray"]["platform.calendar.previousMonthLink"]) ? $KG["i18nArray"]["platform.calendar.previousMonthLink"] : "Previous Month",
            nextMonthI18Text = ($KG["i18nArray"] && $KG["i18nArray"]["platform.calendar.nextMonthLink"]) ? $KG["i18nArray"]["platform.calendar.nextMonthLink"] : "Next Month";
        if(calendarModel.tabpaneId) widgetContext = " ktabpaneid='" + calendarModel.tabpaneId + "' ";
        if(calendarModel.kmasterid) widgetContext = " kmasterid='" + calendarModel.kmasterid + "' ";
        template = '<div w-type="Calendar"  style="display:inline-block;" class="-kony-w-c-popup-container' + '" id="{{id}}" style="height:' + popupHeight + ';width:' + popupWidth + ';">' +
            '<div w-type="Calendar"  class="-kony-w-c-topSection"' + ' >' +
            '<div w-type="Calendar"  class="-kony-w-c-table" style=";width:100%;height:70%;">' +
            _generateHeaderRow(widgetContext, previousMonthI18Text, nextMonthI18Text) +
            '</div>' +
            '<div w-type="Calendar"  class="-kony-w-c-table -kony-w-c-daysHeader" style="width:100%;height:30%;">' +
            _generateDaysRow(widgetContext, calendarModel.cellWidths) +
            '</div>' +
            '</div>' +
            '<div w-type="Calendar" class="kony-w-c-actualDates">' +
            _generateDateCells(widgetContext, calendarModel.cellWidths) +
            '</div>' +
            '</div>';
        return template;
    };
    var _generateDateCells = function(widgetContext, cellWidth) {
        
        var i, j, dateCellsString = "";
        
        for(i = 8; i <= 49; i = i + 7) {
            dateCellsString += '<div w-type="Calendar"  class="-kony-w-c-table -kony-w-c-day-table" style="">' +
                '<div w-type="Calendar"  class="-kony-w-c-row -kony-w-c-day-row">';
            for(j = i; j <= i + 6; j++) {
                dateCellsString += '<div w-type="Calendar" ' + widgetContext + ' kwidgettype="Calendar" class="" id="-kony-w-c-cell-' + j + '"  style="width:' + cellWidth[i - 1] + ';display:table-cell; vertical-align:middle; text-align:center; height:100%;font-size:smaller; position:relative;"></div>';
            }
            dateCellsString += '</div>' +
                '</div>';
        }
        return dateCellsString;
    };
    var _generateDaysRow = function(widgetContext, cellWidth) {
        var i, daysTemplateString = "";
        daysTemplateString += '<div w-type="Calendar"  class="-kony-w-c-row">';
        
        for(i = 1; i <= 7; i++) {
            
            daysTemplateString += '<div ' + widgetContext + ' w-type = "Calendar" class="" id="-kony-w-c-cell-' + i + '" style="width:' + cellWidth[i - 1] + ';display:table-cell; vertical-align:middle; text-align:center; height:100%;font-size:smaller"></div>';
        }
        daysTemplateString += '</div>'
        return daysTemplateString;
    };
    var _generateHeaderRow = function(widgetContext, previousMonthI18Text, nextMonthI18Text) {
        var headerRowString = "";
        headerRowString = '<div w-type="Calendar"  class="-kony-w-c-row">' +
            '<div w-type="Calendar" ' + widgetContext + ' class="-kony-w-c-cell -kony-w-c-prev-nav" style="width:20%;text-align:left;display:table-cell"><img w-type="Calendar" class="-kony-w-c-prev-nav-left-link" alt="' + previousMonthI18Text + '" style="height:15px;width:25px;display:inline-block" /></div>' +
            '<div w-type="Calendar" ' + widgetContext + ' kwidgettype="Calendar" class="-kony-w-c-cell -kony-w-c-yemo" style="width:60%;display:table-cell;text-align:center;outline-color:#FFFFFF;" tabindex="1"></div>' +
            '<div w-type="Calendar" ' + widgetContext + ' class="-kony-w-c-cell -kony-w-c-next-nav" style="width:20%;text-align:right;display:table-cell;"><img w-type="Calendar" class="-kony-w-c-next-nav-right-link" alt="' + nextMonthI18Text + '" style="height:15px;width:25px;display:inline-block" /></div>' +
            '</div>';
        return headerRowString;
    }
    var _generateImageTagString = function(calendarModel, context) {
        var imageTagString, altText = (calendarModel.accessibilityconfig && calendarModel.accessibilityconfig.hint) ? calendarModel.accessibilityconfig.hint : "Calendar",
            imgsrc = calendarModel.Image ? $KU.getImageURL(calendarModel.Image) : $KU.getImageURL("calbtn.gif");

        imageTagString = "<img id='" + calendarModel.id + "_img' type='image' src='" + imgsrc + "' style='float:right;vertical-align:middle' xalign='right' onload='$KW.Calendar.setCalElementStyle(this,false)'";
        if(calendarModel.kmasterid) {
            imageTagString += "kmasterid = '" + calendarModel.kmasterid + "'";
        }
        imageTagString += (calendarModel.title) ? " title='" + calendarModel.title + "'" : "";
        imageTagString += " />";

        return imageTagString;
    };
    var _generateInputTagString = function(calendarModel, context) {
        var inputTagString
        , isDisabled = $KW.Utils.isWidgetDisabled(calendarModel, context) || false;
        inputTagString = "<input id='" + calendarModel.id + "' style='" + $KU.cssPrefix + "appearance: none; text-align: inherit; vertical-align: middle;background:transparent;width:50%;text-decoration:inherit;' name='calBody'";
        if(!kony.appinit.isWindowsPhone && !kony.appinit.isBlackBerry10) {
            inputTagString += " readonly";
        } else if(kony.appinit.isWindowsPhone || kony.appinit.isBlackBerry10) {
            inputTagString += " disabled='disabled'";
        }
        inputTagString += (calendarModel.placeholder) ? " placeholder='" + calendarModel.placeholder + "'" : "";
        inputTagString += (calendarModel.title) ? " title='" + calendarModel.title + "'" : "";
        inputTagString += (calendarModel.disabled) ? " disabled='true'" : "";
        if(calendarModel.kmasterid) {
            inputTagString += " kmasterid = '" + calendarModel.kmasterid + "'";
        }
        inputTagString += (calendarModel.formatteddate) ? (" value='" + calendarModel.formatteddate + "'") : "";
        inputTagString += isDisabled ? " kdisabled='true' disabled='true'" : "";
        inputTagString += " type='text' />";

        return inputTagString;
    };
    var _getByClass = function(element, className) {
        return document.querySelectorAll('#' + element.id + " ." + className);
    };
    var _getBySele = function(element, selector) {
        return document.querySelectorAll('#' + element.id + " " + selector);
    };
    var _getCalendarModelFormCalendarNode = function(calendarNode, containerId) {
        var calendarModel, calendarId = calendarNode.getAttribute("id");
        if(calendarNode.getAttribute("kmasterid")) {
            calendarModel = $KU.getWidgetModelByID(calendarId);
        } else {
            calendarModel = kony.model.getWidgetModel(calendarNode.getAttribute("kformname"), $KU.getElementID(calendarId), calendarNode.getAttribute("ktabpaneid"));
        }
        if(containerId) {
            calendarModel = $KW.Utils.getClonedModelByContainer(calendarModel, calendarNode, containerId);
        }
        return calendarModel;
    };
    var _getDatesInRange = function(calendarModel, dateComponents) {
        var dates = [],
            startDate, endDate, temp, tempDate, _addDays = function(startDate, days) {
                var date = new Date(startDate.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            },
            _getfromtoDate = function(dateComponent1, dateComponent2) {
                if(_isToGtFromDate(dateComponent1, dateComponent2)) {
                    return [dateComponent1, dateComponent2];
                }
                return [dateComponent2, dateComponent1];
            };
        if(dateComponents && dateComponents.length >= 2) {
            tempDate = _getfromtoDate(dateComponents[0], dateComponents[1]);
            startDate = new Date(tempDate[0][1] + "/" + tempDate[0][0] + "/" + tempDate[0][2]);
            dates.push(tempDate[0]);
            endDate = new Date(tempDate[1][1] + "/" + tempDate[1][0] + "/" + tempDate[1][2]);
            while(startDate < endDate) {
                startDate = _addDays(startDate, 1);
                temp = new Date(startDate);
                tempDate = [temp.getDate(), temp.getMonth() + 1, temp.getFullYear()];
                if(_isDateEnabled(calendarModel, [tempDate])) {
                    dates.push(tempDate);
                }
            }
        }
        return dates;
    };
    var _getDisplayDate = function(calendarModel) {
        var formattedDate = "",
            displayDate = "",
            temp = calendarModel.selecteddates || [],
            dateFormat = calendarModel.dateformat,
            _concatinateDate = function(dates, format, seperator) {
                var i, temp, displayDate = "";
                for(i = 0; i < dates.length; i++) {
                    temp = _dateFormatter(format, dates[i]);
                    if(temp != false) {
                        displayDate += temp.string + seperator;
                    }
                }
                if(dates.length > 0) {
                    displayDate = displayDate.slice(0, seperator.length * -1);
                }
                return displayDate;
            };
        if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
            if(temp.length == 2) {
                displayDate = _concatinateDate([temp[0], temp[1]], dateFormat, " - ");
            }
        } else if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_MULTI_SELECT) {
            if(temp.length > 0) {
                displayDate = _concatinateDate(temp, dateFormat, ",")
            }
        }
        return displayDate;
    };
    var _getGridTheme = function(gridTheme) {
        var pickerStyle
        if(gridTheme) {
            pickerStyle = gridTheme;
        } else {
            if($KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8200) {
                pickerStyle = kony.calendar.MODERN;
            } else {
                pickerStyle = kony.calendar.LEGACY;
            }
        }
        return pickerStyle;
    };
    var _getOffset = function(elementNode) {
        var position = $KU.getPosition(elementNode);
        return [position.left, position.top];
    };
    var _hasClass = function(element, className) {
        return(' ' + element.className + ' ').indexOf(' ' + className + ' ') !== -1;
    };
    var _ideDateToString = function(date) {
        if(date) {
            try {
                if(date instanceof Array) {
                    date = eval(date);
                    date = date[0] + "/" + date[1] + "/" + date[2];
                }
            } catch(exception) {
                date = '';
            }
        }
        return date;
    };
    var _initializeCalendarModel = function(calendarModel) {
        var day
        , result, isValidDateSet = false;

        calendarModel.placeholder = calendarModel.placeholder || calendarModel.dateformat || calendarModel.format;
        if(module.isMultiRangeCalendar(calendarModel)) {
            isValidDateSet = module.isSelectedDatesValid(calendarModel, calendarModel.selecteddates);
            if(isValidDateSet) {
                formattedDate = _getDisplayDate(calendarModel);
                calendarModel.formatteddate = formattedDate;
                calendarModel.selectedDates = module.setTimeInDateComponents(calendarModel.selecteddates);
            } else {
                calendarModel.selecteddates = [];
                kony.web.logger("error", "Invalid date selection");
            }
        } else {
            if(calendarModel.date instanceof Array) {
                calendarModel.entereddate = calendarModel.date;
                if(calendarModel.date && calendarModel.date.length > 0) {
                    day = [calendarModel.date[0], calendarModel.date[1], calendarModel.date[2]]
                    result = _dateFormatter(calendarModel.dateformat, day);
                    if(result != false) {
                        calendarModel.dateComponents = result.date;
                        calendarModel.formatteddate = result.string;
                    }
                    calendarModel.day = result.date[0];
                    calendarModel.month = result.date[1];
                    calendarModel.year = result.date[2];
                } else {
                    calendarModel.day = null;
                    calendarModel.month = null;
                    calendarModel.year = null;
                }
                calendarModel.hour = calendarModel.minutes = calendarModel.seconds = 0;
            } else {
                calendarModel.formatteddate = calendarModel.date;
            }
        }

    };
    var _isDateEnabled = function(calendarModel, dates) {
        var i, date, dateValue, datesAll = calendarModel.datesGroupSimplified,
            validStartDateSet, validEndDateSet, minYearLimit = 1900,
            minStartDate, maxYearLimit = 2099,
            maxEndDate;
        if(calendarModel.validstartdate) {
            validStartDateSet = new Date(calendarModel.validstartdate[2], calendarModel.validstartdate[1] - 1, calendarModel.validstartdate[0]).setHours(0, 0, 0, 0);
        }
        if(calendarModel.validenddate) {
            validEndDateSet = new Date(calendarModel.validenddate[2], calendarModel.validenddate[1] - 1, calendarModel.validenddate[0]).setHours(0, 0, 0, 0);
        }
        minStartDate = new Date(minYearLimit, 0, 1).setHours(0, 0, 0, 0); 
        maxEndDate = new Date(maxYearLimit, 11, 31).setHours(0, 0, 0, 0); 
        for(i = 0; i < dates.length; i++) {
            date = new Date(dates[i][2], dates[i][1] - 1, dates[i][0]).setHours(0, 0, 0, 0);
            if(!(minStartDate <= date && date <= maxEndDate)) {
                return false;
            }
            if((validStartDateSet && !(validStartDateSet <= date)) ||
                (validEndDateSet && !(date <= validEndDateSet))) {
                return false;
            }
            if(datesAll) { 
                if(calendarModel.datesState == 0 && datesAll.length > 0 && datesAll.indexOf(date) > -1 ||
                    calendarModel.datesState == 1 && datesAll.length > 0 && datesAll.indexOf(date) <= -1) {
                    return false;
                }
            }
        }
        return true;
    };
    var _isToGtFromDate = function(dateComponent1, dateComponent2) {
        var date1, date2;
        date1 = new Date(dateComponent1[2], dateComponent1[1], dateComponent1[0]);
        date2 = new Date(dateComponent2[2], dateComponent2[1], dateComponent2[0]);
        if(date1 > date2) {
            return false;
        }
        return true;
    };
    var _month = function(month, year, shift, format) {
        var start = new Date(year, month - 1, 1).getDay(),
            days = [],
            day = 1,
            length = new Date(year, month, 0).getDate(),
            flag, prev = {},
            next = {},
            prevCount = 0,
            nextCount = 0,
            prevMonth, nextMonth, j, i, series;
        series = month == 1 ? _series(year - 1, 12, 3) : _series(year, month - 1, 3);
        prev.month = series[0][0];
        prev.year = series[0][1];
        next.month = series[2][0];
        next.year = series[2][1];
        prevMonth = new Date(prev.year, prev.month, 0).getDate(),
            nextMonth = new Date(next.year, next.month, 0).getDate();
        shift = shift || 0;
        if(shift > start) {
            shift -= 7
        }
        for(i = 0; i <= 6; i++) {
            days.push(calendarDaysValue[(i + shift + 7) % 7]);
        }
        for(i = 0; i < 6; i++) {
            for(j = 0; j <= 6; j++) {
                if(day <= length && (i > 0 || j + shift >= start)) {
                    days.push([day, {
                            d: day,
                            y: year,
                            m: month
                        },
                        new Date(year, month - 1, day).getDay()
                    ]);
                    day++;
                    flag = 1;
                } else {
                    if(flag) {
                        days.push(0);
                        nextCount += 1;
                    } else {
                        days.push(-1);
                        prevCount += 1;
                    }
                }
            }
        }
        for(i = 0; i < days.length; i++) {
            if(days[i] == 0) {
                days[i] = flag;
                flag++;
            } else if(days[i] == -1) {
                days[i] = prevMonth - prevCount + 1
                prevCount--;
            }
        }
        return days;
    };
    var _navigatorTemplate = function(model, id, selectedYearValue) {
        var tabpaneID = model.tabpaneId,
            widgetContext = (" kformname='" + model.pf + "' ") + (tabpaneID && " ktabpaneid='" + tabpaneID + "' ") + (model.kmasterid && " kmasterid='" + model.kmasterid + "' "),
            navigatorString = "",
            _getNavigatorHeaderString = function(widgetContext, id) {
                var headerString = "",
                    cancelI18Text = $KG["i18nArray"] ? $KG["i18nArray"] ? $KG["i18nArray"]["platform.calendar.cancelImage"] : "Cancel Selection" : "Cancel Selection",
                    doneI18Text = $KG["i18nArray"] ? $KG["i18nArray"] ? $KG["i18nArray"]["platform.calendar.selectedImage"] : "Done Selecting" : "Done Selecting";
                headerString = "" +
                    "<div w-type='Calendar'  class='-kony-w-c-navigator-table' style='display:table;table-layout:fixed;height:15%;width:100%;'>" +
                    "<div w-type='Calendar'  style='display:table-row;width:100%;height:100%'>" +
                    "<div w-type='Calendar'  style='display:table-cell;width:15%;text-align:left;vertical-align:middle' class='-kony-w-c-cancel-nav' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "<img w-type='Calendar' alt='" + cancelI18Text + "' class='-kony-w-c-cancel-nav' style='height:50%;width:50%;' src='" + $KU.getImageURL("k-cancel.png") + "' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "</div>" +
                    "<div w-type='Calendar' w-type-inactive='true' style='display:table-cell;width:70%;text-align:center;vertical-align:middle' class='-k-w-c-nav-selected-ym" + "'>" +
                    "</div>" +
                    "<div w-type='Calendar'  style='display:table-cell;width:15%;text-align:right;vertical-align:middle' class='-kony-w-c-go-nav' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "<img w-type='Calendar'  alt='" + doneI18Text + "'class='-kony-w-c-go-nav' style='height:50%;width:50%;' src='" + $KU.getImageURL("k-go.png") + "' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                return headerString;
            },
            _getYearNavigationString = function(widgetContext, id) {
                var yearNavigationString = "",
                    leftArrowbg = $KU.getImageURL("left-arrow.png"),
                    rightArrowbg = $KU.getImageURL("right-arrow.png"),
                    previousYearsI18Key = $KG["i18nArray"] ? $KG["i18nArray"] ? $KG["i18nArray"]["platform.calendar.previousYearLink"] : "Previous set of Years" : "Previous set of Years",
                    nextYearsI18Key = $KG["i18nArray"] ? $KG["i18nArray"] ? $KG["i18nArray"]["platform.calendar.nextYearLink"] : "Next set of Years" : "Next set of Years";
                yearNavigationString = "" +
                    "<div w-type='Calendar'  class='-kony-w-c-navigator-table' style='display:table;table-layout:fixed;height:15%;width:100%'>" +
                    "<div w-type='Calendar'   style='display:table-row;width:100%;height:100%'>" +
                    "<div w-type='Calendar' style='display:table-cell;width:15%;text-align:left;vertical-align:middle' class='-kony-w-c-left-ym-p' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "<img class='-kony-w-c-left-ym-p' src = '" + leftArrowbg + "' alt='" + previousYearsI18Key + "' style='height:15px;width:25px;display:inline-block' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " />" +
                    "</div>" +
                    "<div w-type-inactive='true'  w-type='Calendar' style='display:table-cell;width:70%;text-align:center;vertical-align:middle' class='-k-w-c-nav-yr-range'>" +
                    "</div>" +
                    "<div w-type='Calendar'  style='display:table-cell;width:15%;text-align:right;vertical-align:middle' class='-kony-w-c-right-ym-p' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                    "<img w-type='Calendar'  class='-kony-w-c-right-ym-p' src = '" + rightArrowbg + "' alt='" + nextYearsI18Key + "'style='height:15px;width:25px;display:inline-block' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " />" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                return yearNavigationString;
            },
            _getMonthsString = function(widgetContext, id) {
                var monthString = "",
                    months = calendarMonthsValues.slice(0),
                    monthsInRow, i, j;
                monthString += "<div w-type='Calendar'  class='-kony-w-c-navigator-table' style='display:table;table-layout:fixed;height:30%;width:100%;border-bottom:1px solid #FAFAFA'>";
                months = _chunks(months, 6);
                for(i = 0; i < months.length; i++) {
                    monthsInRow = months[i];
                    monthString += "<div w-type='Calendar'   style='display:table-row;width:100%;height:50%'>";
                    for(j = 0; j < monthsInRow.length; j++) {
                        monthString += "<div w-type='Calendar' role='option' aria-label='" + monthsInRow[j] + "' style='display:table-cell;width:15%;text-align:center;vertical-align:middle;font-size:smaller' class='-kony-w-c-navigator-month" + "' k-w-c-hold='" + ((i * 6) + (j + 1)) + "' k-w-c-id='" + id + "' kwidgettype='Calendar'" + widgetContext + " >" +
                            monthsInRow[j].substring(0, 3) +
                            "</div>";
                    }
                    monthString += "</div>";
                }
                monthString += "</div>";
                return monthString;
            },
            _getCounter = function(selectedYearValue) {
                var iterator, counter = 2001,
                    temp;
                if(selectedYearValue) {
                    selectedYearValue = Number(selectedYearValue);
                } else {
                    selectedYearValue = null;
                }
                if(selectedYearValue != null) {
                    if(selectedYearValue > counter) {
                        iterator = Math.floor((selectedYearValue - 2001) / 16);
                        for(temp = 0; temp < iterator; temp++) {
                            counter = counter + 16;
                        }
                    } else {
                        iterator = Math.ceil((2001 - selectedYearValue) / 16);
                        for(temp = 0; temp < iterator; temp++) {
                            counter = counter - 16;
                        }
                    }
                }
                return counter;
            },
            _getYearsString = function(widgetContext, id) {
                var i, yearsString = "",
                    counter;
                counter = _getCounter(selectedYearValue);
                for(i = 1; i <= 4; i++) { 
                    yearsString += "<div w-type='Calendar'   style='display:table-row;width:100%;height:25%'>";
                    for(j = 1; j <= 4; j++) { 
                        
                        if((counter > 1900 && counter < 2099) || counter == 2099 || counter == 1900) {
                            yearsString += "<div w-type='Calendar' role='option' aria-label = '" + counter + "' style='display:table-cell;width:25%;text-align:center;vertical-align:middle;font-size:smaller;visibility:visible;' class='-kony-w-c-navigator-year" + "' k-w-c-hold='" + counter + "' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                                counter +
                                "</div>";
                        } else {
                            yearsString += "<div w-type='Calendar' role='option' aria-label = '" + counter + "' style='display:table-cell;width:25%;text-align:center;vertical-align:middle;font-size:smaller;visibility:hidden;' class='-kony-w-c-navigator-year" + "' k-w-c-hold='" + counter + "' k-w-c-id='" + id + "' kwidgettype='Calendar' " + widgetContext + " >" +
                                counter +
                                "</div>";
                        }
                        counter++;
                    }
                    yearsString += "</div>";
                }
                return yearsString;
            };

        
        navigatorString = "<div w-type='Calendar' id='" + (model.id + "-k-w-c-navigator-") + "' class='-k-w-c-datepicker-navigator" + "' kwidgettype='Calendar' " + widgetContext + " style='height:" + model.popupHeight + ";width:" + model.popupWidth + ";position:absolute;background-color:White'>";

        
        navigatorString += _getNavigatorHeaderString(widgetContext, id);

        
        navigatorString += _getMonthsString(widgetContext, id);

        
        navigatorString += _getYearNavigationString(widgetContext, id);

        
        navigatorString += "<div w-type='Calendar'  class='-kony-w-c-navigator-table' style='display:table;table-layout:fixed;height:40%;width:100%'>";

        
        navigatorString += _getYearsString(widgetContext, id);

        
        navigatorString += "</div></div>";
        return navigatorString;
    };
    var _reAssignData = function(calendarModel) {
        
        var config, validMonth, yearStored, defaultSelectedCellSkin, defaulTodaySelectedCellSkin, pickerStyle = _getGridTheme(calendarModel.gridTheme),
            validYear;
        if(!calendarModel.datecomponents) {
            _setCurrentDate(calendarModel);
            calendarModel.minutes = 0;
            calendarModel.hour = 0;
            calendarModel.seconds = 0;
        }
        if(calendarModel.noofmonths < 1 || isNaN(calendarModel.noofmonths * 1)) {
            calendarModel.noofmonths = 1;
        }
        calendarModel.datesGroup = [];
        calendarModel.datesState = calendarModel.datesState || 0;
        calendarModel.dateformat = calendarModel.dateformat || calendarModel.format || "dd/mm/yyyy";
        
        calendarModel.popupHeight = calendarModel.popupHeight || Math.min.apply(Math, [300, window.innerHeight || document.documentElement.clientHeight]) + "px";
        calendarModel.popupWidth = calendarModel.popupWidth || Math.min.apply(Math, [300, window.innerWidth || document.documentElement.clientWidth]) + "px";
        
        calendarModel.startDay = calendarModel.startDay || 0;
        if(!calendarModel.viewconfig) {
            calendarModel.viewconfig = {
                gridConfig: {},
                gridconfig: {}
            };
        }
        config = calendarModel.viewconfig.gridconfig || calendarModel.viewconfig.gridConfig || {};
        config.gridCellWeekendSkin = config.gridCellWeekendSkin || config.gridcellweekendskin || "-kony-w-c-weekend-";
        config.gridCellInactiveDaysSkin = config.gridCellInactiveDaysSkin || config.gridcellinactivedaysskin || "-k-w-c-inactive";
        config.gridCellSkin = config.gridCellSkin || config.gridcellskin || "-kony-w-c-day-skin";
        if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
            defaultSelectedCellSkin = "-kony-w-c-selected-inrange";
            defaulTodaySelectedCellSkin = "-k-w-c-today-selected-inrange";
        } else {
            defaultSelectedCellSkin = "-kony-w-c-selected-";
            defaulTodaySelectedCellSkin = "-k-w-c-today-selected";
        }
        config.gridCellSelectedSkin = config.gridCellSelectedSkin || config.gridcellselectedskin || defaultSelectedCellSkin;
        config.gridCellTodaySkin = config.gridCellTodaySkin || config.gridcelltodayskin || "-kony-w-c-today-";
        if(pickerStyle == kony.calendar.LEGACY) {
            defaulTodaySelectedCellSkin = "";
        }
        config.gridCellSelectedTodaySkin = config.gridCellSelectedTodaySkin || config.gridcellselectedtodayskin || defaulTodaySelectedCellSkin;
        config.gridCellFromDateSkin = config.gridCellFromDateSkin || config.gridcellfromdateskin || "-k-w-c-cal-from-date";
        config.gridCellToDateSkin = config.gridCellToDateSkin || config.gridcelltodateskin || "-k-w-c-cal-to-date";
        config.doneButtonSkin = config.doneButtonSkin || '-k-w-c-apply-picker';
        config.cancelButtonSkin = config.cancelButtonSkin || '-k-w-c-close-picker';
        config.monthHeaderSkin = config.monthHeaderSkin || " -kony-w-c-yemo-skin";
        config.dayHeaderSkin = config.dayHeaderSkin || " -kony-w-c-day-label-cell";
        if(config.allowWeekendSelectable == undefined) {
            config.allowWeekendSelectable = config.allowweekendselectable;
        }
        if(calendarModel.validStartDate) {
            validMonth = calendarModel.validStartDate[2];
            validYear = calendarModel.validStartDate[1];
        }
        validYear = calendarModel.year || validYear || new Date().getFullYear(),
            validMonth = calendarModel.month || validMonth || new Date().getMonth() + 1;
        calendarModel.displayedMonths = calendarModel.displayedMonths || [validMonth, validYear]; 
        calendarModel.dayTextAlignmentInCell = calendarModel.dayTextAlignmentInCell || "CONTENT_ALIGN_CENTER";
        if(calendarModel.year) {
            yearStored = calendarModel.year.toString();
            if(yearStored.length > 4) {
                calendarModel.year = yearStored.substr(yearStored.length - 4) * 1;
            }
        }
        calendarModel.navigatorAlert = $KG["i18nArray"] && $KG["i18nArray"]["gridCalAlertI18Nkey"] ? kony.i18n.getLocalizedString("gridCalAlertI18Nkey") : (calendarModel.navigatorAlert || "Invalid Selection");
    };
    var _removeClass = function(element, className) {
        element.className = _trim((' ' + element.className + ' ').replace(' ' + className + ' ', ' '));
    };
    var _removeTabIndexs = function() {
        var previousTabIndexClear = document.querySelectorAll('[tabindex]'),
            i;
        for(i = 0; i < previousTabIndexClear.length; i++) {
            if("Calendar" === previousTabIndexClear[i].getAttribute('kwidgettype')) {
                previousTabIndexClear[i].removeAttribute('tabindex');
            }
        }
    };
    var _reposition = function(repositionFlag) {
        var calendarElement = document.querySelector("div[id$='-k-w-c-datepicker']"),
            calendarElementHeight, windowWidth, top, left;
        if(calendarElement) {
            calendarElementHeight = calendarElement.clientHeight;
            windowWidth = window.innerWidth || document.documentElement.clientWidth;
            top = (window.pageYOffset + ((window.innerHeight - calendarElementHeight) / 2));
            calendarElement.style.left = "0px";
            left = ((windowWidth - calendarElement.clientWidth) / 2);
            if((left * 2 + calendarElement.clientWidth) > windowWidth) {
                left = 0;
            }
            calendarElement.style.top = (top > 0 ? top : 0) + "px";
            calendarElement.style.left = left + "px";
            if(repositionFlag != 1) {
                calendarElement.innerHTML = calendarElement.innerHTML;
            }
        }
    };
    var _series = function(y, mn, nfm) {
        var ms = [
                [mn, y]
            ],
            m;
        y = parseInt(y, 10);
        mn = parseInt(mn, 10);
        for(m = 0; m < nfm - 1; m++) {
            if(mn + 1 > 12) {
                mn = 1;
                y += 1;
                ms.push([mn, y]);
            } else {
                mn += 1;
                ms.push([mn, y]);
            }
        }
        return ms;
    };
    var _setCurrentDate = function(calendarModel) {
        var todayDate = new Date();
        calendarModel.datecomponents = [];
        calendarModel.datecomponents = [0, 0, 0, 0, 0, 0];
        calendarModel.datecomponents[1] = todayDate.getMonth() + 1;
        calendarModel.datecomponents[2] = todayDate.getFullYear();
    };
    var _adjustFlexLayoutInCellTemplate = function(calendarModel) {
        var celltemplates = document.querySelectorAll("div[kcelltemplate]"),
            cellLength = celltemplates.length,
            cellItem = 0,
            height = 0,
            cellTemplateNode, calendarNode = null,
            templateNode = null;

        for(cellItem = 0; cellItem < cellLength; cellItem++) {
            cellTemplateNode = celltemplates[cellItem];
            calendarNode = cellTemplateNode.parentNode;
            _adjustStyleDivForTemplateInGridCell(calendarNode.childNodes[1]);
            calendarModel.celltemplate.layoutConfig = {
                self: true,
                children: true
            };
            templateNode = calendarNode.childNodes[1].firstElementChild;
            $KW.FlexContainer.forceLayout(calendarModel.celltemplate, templateNode);
        }
    };
    var _show = function(calendarModel, targetCalendar, ms, flag) {
        var calendarHTML = "",
            currentDate = new Date(),
            invalidSelectionAlert, numberOfMonths, popupHeight = calendarModel.popupHeight || "300px",
            popupWidth = calendarModel.popupWidth || "300px",
            mainContainer = document.getElementById("__MainContainer"),
            mouseEvent, startYear, startMonth, startDay, popupTemplate, formElement, children, navigators, monthData, element, exists, retDIV, close, id, i, _getTitleElement = function(calendarModel) {
                var title = document.createElement('div');
                title.className = "-k-w-c-cal-title";
                title.id = "-k-w-c-cal-title";
                title.setAttribute('w-type', 'Calendar');
                title.innerHTML = calendarModel.title;
                return title;
            },
            _getCloseElement = function(calendarModel, targetCalendarId) {
                var close = document.createElement('div'),
                    tabpaneID = calendarModel.tabpaneId,
                    closeText = $KG["i18nArray"] && $KG["i18nArray"]["gridCalCloseI18Nkey"] ? kony.i18n.getLocalizedString("gridCalCloseI18Nkey") : "Close",
                    calendarConfig = calendarModel.viewconfig.gridconfig || calendarModel.viewconfig.gridConfig || {};;
                close.innerHTML = "<a href='#' class=" + calendarConfig.cancelButtonSkin + " id='calendar-close-link' kformname='" + calendarModel.pf + "' kwidgettype='Calendar' " + (calendarModel.kmasterid ? " kmasterid='" + calendarModel.kmasterid + "' " : "") + +(tabpaneID ? "ktabpaneid='" + tabpaneID + "' " : "") + " style='float:right;'>" + closeText + "</a>";
                close.setAttribute('w-type', "Calendar");
                close.firstChild.setAttribute('k-w-c-id', targetCalendarId);
                return close;
            },
            _getApplyElement = function(calendarModel, targetCalendarId) {
                var apply = document.createElement('div'),
                    tabpaneID = calendarModel.tabpaneId,
                    applyText = $KG["i18nArray"] && $KG["i18nArray"]["gridCalApplyI18Nkey"] ? kony.i18n.getLocalizedString("gridCalApplyI18Nkey") : "Apply",
                    calendarConfig = calendarModel.viewconfig.gridconfig || calendarModel.viewconfig.gridConfig || {};;
                apply.innerHTML = "<a href='#' class=" + calendarConfig.doneButtonSkin + " id='calendar-apply-link' kformname='" + calendarModel.pf + "' kwidgettype='Calendar' " + (calendarModel.kmasterid ? " kmasterid='" + calendarModel.kmasterid + "' " : "") + +(tabpaneID ? "ktabpaneid='" + tabpaneID + "' " : "") + " style='float:right;margin-right:20px;visibility:hidden'>" + applyText + "</a>";
                apply.setAttribute('w-type', "Calendar");
                apply.firstChild.setAttribute('k-w-c-id', targetCalendarId);
                return apply;
            },
            _addScrimToDocument = function() {
                var scrim = document.createElement('div'),
                    documentBody, documentHeight;
                scrim.className = "k-w-c-scrim-for-popup";
                documentBody = document.body;
                documentHeight;
                if(document.height != undefined) {
                    documentHeight = document.height;
                } else {
                    if(documentBody.scrollHeight != undefined && documentBody.offsetHeight != undefined) {
                        if(!kony.appinit.isWindowsPhone) {
                            documentHeight = Math.max(documentBody.scrollHeight, documentBody.offsetHeight);
                        } else {
                            documentHeight = 100;
                        }
                    } else {
                        documentHeight = documentBody.scrollHeight || documentBody.offsetHeight;
                    }

                }
                if(!kony.appinit.isWindowsPhone) {
                    scrim.innerHTML = "<div style='height:" + documentHeight + "px;width:100%;opacity:0;line-height:100%'>&nbsp;</div>";
                } else {
                    scrim.innerHTML = "<div style='height:" + documentHeight + "%;width:100%;opacity:0;line-height:100%'>&nbsp;</div>";
                    scrim.style.height = "100%";
                }
                scrim.style.position = "absolute";
                scrim.style.top = scrim.style.left = "0px";
                scrim.style.height = "100%"; 
                scrim.style.width = "100%";
                scrim.style.zIndex = "1230";
                if($KU.isIE11)
                    scrim.style.transform = "translateZ(0px)";
                document.getElementById("__MainContainer").appendChild(scrim);
            },
            _getContextWidgetNode = function(calendarModel, calendarNode, contextWidgetId) {
                var templateNode, contextWidgetNode;
                if(contextWidgetId === calendarModel.id) {
                    contextWidgetNode = calendarNode;
                } else {
                    templateNode = $KW.Utils.getContainerNodeByparent(calendarNode, calendarModel.pf);
                    contextWidgetNode = templateNode.parentNode.querySelector("div[id='"+calendarModel.pf+"_"+ contextWidgetId +"']");
                }
                return contextWidgetNode;
            },
            _setContextTopLeft = function(calendarModel, element, calendarNode) {
                var anchorPos, contextWidgetNode;
                if(typeof calendarModel.context.widget === 'string') {
                    contextWidgetNode = _getContextWidgetNode(calendarModel, calendarNode, calendarModel.context.widget);
                } else if(calendarModel.context.widget.isCloned) {
                    contextWidgetNode = _getContextWidgetNode(calendarModel, calendarNode, calendarModel.context.widget.id);
                }
                anchorPos = $KU.getAnchorPosition(calendarModel, element, contextWidgetNode);
                element.style.top = anchorPos.topPos + 'px';
                element.style.left = anchorPos.leftPos + 'px';
            },
            _setNonContextTopLeft = function(targetCalendar, element) {
                var position = _getOffset(targetCalendar);
                element.style.top = position[1] + targetCalendar.offsetHeight + "px";
                element.style.left = (((window.innerWidth || document.documentElement.clientWidth) - element.clientWidth) / 2) + "px";
            };
        this.invoked = this.invoked || {};
        this.invoked[targetCalendar.id] = this.invoked[targetCalendar.id] || {
            d: targetCalendar,
            i: targetCalendar.firstChild.id,
            s: ""
        };
        if(calendarModel.validStartDate) {
            startDay = calendarModel.validStartDate[0];
            startMonth = calendarModel.validStartDate[1];
            startYear = calendarModel.validStartDate[2];
        }
        startYear = calendarModel.year || startYear || currentDate.getFullYear();
        startMonth = calendarModel.month || startMonth || currentDate.getMonth() + 1;
        numberOfMonths = calendarModel.noofmonths;
        if(ms && ms[0] && !flag) {
            exists = true;
        }
        if(calendarModel.showcurrentdate) {
            startYear = currentDate.getFullYear();
            startMonth = currentDate.getMonth() + 1;
        }
        ms = ms || _series(startYear, startMonth, numberOfMonths);
        calendarModel.cellWidths = calendarModel.cellWidths || ["14.2857%;", "14.2857%;", "14.2857%;", "14.2857%;", "14.2857%;", "14.2857%;", "14.2857%;"];
        popupTemplate = _generateCalendarTemplate(calendarModel, popupHeight, popupWidth);
        element = document.getElementById(targetCalendar.id + '-k-w-c-datepicker') || document.createElement('div');
        if(element.id == "") {
            if(calendarModel.title) {
                element.appendChild(_getTitleElement(calendarModel));
            }
            element.id = targetCalendar.id + '-k-w-c-datepicker';
        }
        element.setAttribute('w-type', 'Calendar');
        this.invoked[targetCalendar.id].s = "active";
        children = _getByClass(element, '-kony-w-c-popup-container');
        calendarModel.displayedMonths = [ms[0][0], ms[0][1]];
        for(i = 0; i < Number(calendarModel.noofmonths); i++) {
            navigators = [1, 1];
            monthData = _month(ms[i][0], ms[i][1], calendarModel.startDay);
            id = ('-k-w-c-month-cmp-' + ms[i][0] + "-" + ms[i][1]);
            if(children[i]) {
                children[i].id = id;
            }
            popupTemplate = popupTemplate.replace('{{id}}', id);
            retDIV = _updateMonthData(monthData, calendarModel, popupTemplate, ms[i], navigators, children[i] || 0, targetCalendar.id);
            if(retDIV != 0) {
                element.appendChild(retDIV);
            }
        }
        if(exists == true) {
            _applySkins(calendarModel);
            return;
        }
        element.className = "-k-w-c-datepicker-holder-main " + _getGridTheme(calendarModel.gridTheme);
        element.style.position = "absolute";
        element.style.border = "1px solid #CCC";
        element.appendChild(_getCloseElement(calendarModel, targetCalendar.id));
        if(module.isMultiRangeCalendar(calendarModel)) {
            element.appendChild(_getApplyElement(calendarModel, targetCalendar.id));
        }
        element.style.zIndex = "1234";
        if($KU.isMobile() || $KU.isTablet) {
            element.setAttribute('dummy', 'a');
            element.style.display = "none";
            mainContainer.appendChild(element);
            element.style.display = "inline-block";
            _reposition(1);
            _addScrimToDocument();
            formElement = document.getElementById(calendarModel.pf);
            if(formElement != null) {
                formElement.setAttribute('aria-hidden', true);
            }
            if(calendarModel.context) {
                _setContextTopLeft(calendarModel, element, module.activeCalendarNode);
            }
        } else {
            mainContainer.appendChild(element);
            element.style.display = "inline-block";
            _setNonContextTopLeft(targetCalendar, element);
        }
        module.active = targetCalendar.id + '-k-w-c-datepicker';
        _applySkins(calendarModel);
        _adjustFlexLayoutInCellTemplate(calendarModel);
    };
    var _trim = function(stringToTrim) {
        return stringToTrim.trim ? stringToTrim.trim() : stringToTrim.replace(/^\s+|\s+$/g, '');
    };
    var _checkTemplateDefinedForGridCell = function(calendarModel, dateString) {
        var data, date, templateData, i = 0,
            templateDate = {},
            templateDateString;

        data = calendarModel.data;
        date = _dateFormatter(calendarModel.dateformat, [dateString.date[0], dateString.date[1], dateString.date[2]]);
        templateData = Object.keys(calendarModel.data);
        for(i = 0; i < templateData.length; i++) {
            
            templateDateString = templateData[i].split('/');
            templateDate = _dateFormatter(calendarModel.dateformat, [templateDateString[0], templateDateString[1], templateDateString[2]]);
            if(templateDate.string == date.string) {
                return i;
            }
        }
        return -1;
    };
    var _convertDataMaptoData = function(calendarModel, data, templateDate) {
        var map = calendarModel.widgetdatamapforcell || {},
            masterdata = {},
            keys = $KU.getkeys(map),
            newmap = {},
            newkeys = {},
            i = 0,
            j = 0,
            value = '';

        for(i = 0; i < keys.length; i++) {
            newmap[map[keys[i]]] = keys[i];
        }
        newkeys = $KU.getkeys(newmap);
        for(j = 0; j < newkeys.length; j++) {
            value = data[templateDate][newkeys[j]];
            if(value && typeof value != "object" && typeof value !== "number" && value.toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
                masterdata[newkeys[j]] = $KU.getI18NValue(value);
            } else {
                masterdata[keys[j]] = value;
            }
        }
        return masterdata;
    };
    var _renderGridCalendarCellTemplate = function(calendarModel, dateString, element, templateIndex, templateFlag) {
        var templateDiv = document.createElement('div');

        element.appendChild(templateDiv);
        templateDiv.setAttribute('kcellTemplate', true);
        if(templateFlag == 1) {
            _adjustStyleDivForTemplateInGridCell(element.childNodes[1]);
        }
        calCellTemplate = _createClonedTemplateUsingMasterData(calendarModel, templateIndex);
        _renderAndAdjustCellTemplateDimensions(calCellTemplate, element, calendarModel);
    };
    var _renderAndAdjustCellTemplateDimensions = function(calCellTemplate, element, calendarModel) {
        var templateHTML = $KW.FlexContainer.render(calCellTemplate, {}),
            templateNode;

        element.childNodes[1].innerHTML = templateHTML;
        templateNode = element.childNodes[1].firstElementChild;
        calCellTemplate.layoutConfig = {
            self: true,
            children: true
        };
        $KW.FlexContainer.forceLayout(calCellTemplate, templateNode);
        templateNode.style.height = element.childNodes[1].style.height;
    };
    var _createClonedTemplateUsingMasterData = function(calendarModel, templateIndex) {
        var calCellTemplate = owl.deepCopy(calendarModel.celltemplate, null, false);

        if(typeof calCellTemplate == "string") {
            calCellTemplate = _kony.mvc.initializeSubViewController(calCellTemplate);
        }
        _getMasterDataAndUpdateWidgetData(calendarModel, templateIndex, calCellTemplate);
        return calCellTemplate;
    };
    var _getMasterDataAndUpdateWidgetData = function(calendarModel, templateIndex, calCellTemplate) {
        var templateData = [],
            templateDateList = [],
            cellTemplateDate = '',
            templateContainerWidgetsLength, templateWidgetModel, templateWidgetData;

        if(calendarModel.data) {
            templateDateList = Object.keys(calendarModel.data)
            cellTemplateDate = templateDateList[templateIndex];
            templateData = _convertDataMaptoData(calendarModel, calendarModel.data, cellTemplateDate);
            _updateTemplateWidgetDataWithMasterData(calCellTemplate, templateData);
        }
    };
    var _updateTemplateWidgetDataWithMasterData = function(calCellTemplate, templateData) {
        var templateContainerWidgetsLength, templateWidgetModel, templateWidgetData,
            templateContainerWidgets, widgetCount = 0;

        templateContainerWidgets = calCellTemplate.widgets();
        templateContainerWidgetsLength = templateContainerWidgets.length;
        for(widgetCount = 0; widgetCount < templateContainerWidgetsLength; widgetCount++) {
            templateWidgetModel = templateContainerWidgets[widgetCount];
            templateWidgetData = templateData[templateWidgetModel.id];
            $KW.Utils.updateChildModel(templateWidgetModel, templateWidgetData);
        }
    };
    var _adjustStyleDivForTemplateInGridCell = function(templateDivElement) {
        templateDivElement.style.position = 'absolute';
        templateDivElement.style.left = '0px';
        templateDivElement.style.top = '0px';
        templateDivElement.style.height = '100%';
        templateDivElement.style.width = '100%';
    };
    var _updateMonthData = function(monthData, calendarModel, template, dateConfig, navigators, div, id) {
        
        var divFlag, config = calendarModel.viewconfig.gridconfig || calendarModel.viewconfig.gridConfig || {},
            isWeek = config.allowWeekendSelectable,
            flag = 0,
            monthHeader, leftImage, rightImage, currentMonthValue, imageSrcNextNavigation, dateString, dayTextAlignmentInCell, imageSrcPrevNavigation, bg, j, unit, daysHeader, element, _setPrevNextMonthElementStyleNAriaLabel = function(element, config, unit, flag) {
                if(flag == 0) {
                    element.className = " -k-w-c-lastMonth " + config.gridCellInactiveDaysSkin;
                    element.setAttribute('title', 'Previous month');
                    element.setAttribute('aria-label', unit);
                } else if(flag == 1) {
                    element.className = " -k-w-c-nextMonth " + config.gridCellInactiveDaysSkin;
                    element.setAttribute('title', 'Next month');
                    element.setAttribute('aria-label', unit);
                }
                element.removeAttribute('kwidgettype');
                element.removeAttribute('k-w-c-hold-day');
                element.innerHTML = unit;
            },
            _setWeekElementStyleNAriaLabel = function(element, config, unit) {
                element.innerHTML = unit;
                element.setAttribute('role', 'option');
                if(unit == "MON" || unit == "SUN") {
                    element.setAttribute('aria-label', unit.toLowerCase() + 'day');
                } else if(unit == "TUE") {
                    element.setAttribute('aria-label', 'Tuesday');
                } else if(unit == "WED") {
                    element.setAttribute('aria-label', 'Wednesday');
                } else if(unit == "THU") {
                    element.setAttribute('aria-label', 'Thursday');
                } else if(unit == "FRI") {
                    element.setAttribute('aria-label', 'Friday');
                } else if(unit == "SAT") {
                    element.setAttribute('aria-label', 'Saturday');
                }
                element.className += " " + config.dayHeaderSkin;
            },
            _setNavigatorStyleNImage = function(calendarModel, navigatorElement, configImage, id, defaultImage) {
                var templateIndex = 0,
                    templateFlag = 0;

                if(configImage) {
                    
                    
                    navigatorElement.firstChild.src = $KU.getImageURL(configImage);
                    navigatorElement.firstChild.style.cssText = "max-width:60px;max-height:40px;";
                    
                    navigatorElement.firstChild.setAttribute('kformname', calendarModel.pf);
                } else {
                    navigatorElement.firstChild.setAttribute('src', defaultImage);
                    
                }
                navigatorElement.setAttribute('k-w-c-id', id);
                navigatorElement.firstChild.setAttribute('k-w-c-id', id);
                navigatorElement.setAttribute('kwidgettype', 'Calendar');
            };
        if(div == 0) {
            div = document.createElement('div');
            div.innerHTML = template;
            div = div.firstChild;
            document.body.appendChild(div);
            divFlag = 0;
        }
        _addClass(div, config.gridSkin);
        monthHeader = _getBySele(div, '.-kony-w-c-yemo')[0];
        if(calendarModel.hideMonthsHeader == true) {
            monthHeader.style.display = "none";
        }
        daysHeader = _getBySele(div, '.-kony-w-c-daysHeader')[0];
        if(calendarModel.hideDaysHeader == true) {
            daysHeader.style.display = "none";
        }
        div.setAttribute('month', dateConfig[0]);
        div.setAttribute('year', dateConfig[1]);
        monthHeader.innerHTML = calendarMonthsValues[dateConfig[0] - 1] + ", " + dateConfig[1];
        _addClass(monthHeader, config.monthHeaderSkin);
        monthHeader.setAttribute('k-w-c-id', id);
        for(j = 0; j < monthData.length; j++) {
            unit = monthData[j],
                element = _getBySele(div, '#-kony-w-c-cell-' + (j + 1))[0];
            element.className = "";
            dayTextAlignmentInCell = _dayTextAlignmentInCell(calendarModel.dayTextAlignmentInCell);
            element.style.textAlign = dayTextAlignmentInCell['text-align'];
            element.style.verticalAlign = dayTextAlignmentInCell['vertical-align'];
            if(typeof unit == "number") { 
                _setPrevNextMonthElementStyleNAriaLabel(element, config, unit, flag);
            } else if(typeof unit == "string") { 
                _setWeekElementStyleNAriaLabel(element, config, unit);
            } else {
                flag = 1;
                if((unit[2] == 0 || unit[2] == 6) && (isWeek == false)) {
                    element.className = " " + config.gridCellInactiveDaysSkin;
                    element.innerHTML = ($KG["i18nArray"] && $KG["i18nArray"]["platform.calendar." + unit[0]]) ? $KG["i18nArray"]["platform.calendar." + unit[0]] : unit[0];
                    element.removeAttribute('kwidgettype');
                } else {
                    element.setAttribute('k-w-c-id', id);
                    element.setAttribute('kwidgettype', "Calendar");
                    element.setAttribute('weekday', unit[2]);
                    element.className += " -k-w-c-weekday-" + unit[2] + " -kony-w-c-day-";
                    element.setAttribute('k-w-c-hold-day', (unit[1].d + "," + unit[1].m + "," + unit[1].y));
                    element.innerHTML = ($KG["i18nArray"] && $KG["i18nArray"]["platform.calendar." + unit[0]]) ? $KG["i18nArray"]["platform.calendar." + unit[0]] : unit[0];
                    dateString = _dateFormatter("dddd, do mmmm yyyy", [unit[1].d, unit[1].m, unit[1].y]);
                    
                    element.setAttribute('role', 'option');
                    
                    
                    
                    
                    currentMonthValue = dateString.string.split(',')[1];
                    element.setAttribute('aria-label', currentMonthValue);
                    if(calendarModel.celltemplate) {
                        templateIndex = _checkTemplateDefinedForGridCell(calendarModel, dateString);
                        templateFlag = 0;
                        if(templateIndex >= 0) {
                            if((document.querySelectorAll("div[id$='-k-w-c-datepicker']").length) != 0) {
                                templateFlag = 1;
                            }
                            calendarModel.celltemplate.pf = calendarModel.celltemplate.id;
                            _renderGridCalendarCellTemplate(calendarModel, dateString, element, templateIndex, templateFlag);
                        }
                    }
                }
            }
        }
        bg = $KU.getImageURL("sprite.png");
        if(navigators[0] == 1) {
            navigatorElement = _getByClass(div, '-kony-w-c-prev-nav')[0];
            imageSrcNextNavigation = config.leftNavigationImage ? config.leftNavigationImage : config.leftnavigationimage;
            leftImage = $KU.getImageURL("left-arrow.png");
            _setNavigatorStyleNImage(calendarModel, navigatorElement, imageSrcNextNavigation, id, leftImage);
        }
        if(navigators[1] == 1) {
            navigatorElement = _getByClass(div, '-kony-w-c-next-nav')[0];
            imageSrcNextNavigation = config.rightNavigationImage ? config.rightNavigationImage : config.rightnavigationimage;
            rightImage = $KU.getImageURL("right-arrow.png");
            _setNavigatorStyleNImage(calendarModel, navigatorElement, imageSrcNextNavigation, id, rightImage);
        }
        if(divFlag == 0) {
            return div;
        } else {
            return 0;
        }
    };
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Calendar", _eventHandler);
            kony.events.addEvent("onorientationchange", "Calendar", _reposition);
        },
        
        initializeView: function() {
            calendarDaysValue = (function() {
                var defaultDayValues = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
                    localData = [],
                    i18Sunday, i18Monday, i18Tuesday, i18Wednesday, i18Thursday, i18Friday, i18Saturday;
                if($KG["i18nArray"] && $KG["i18nArray"]["weekdayI18Nkey"]) {
                    var localData = kony.i18n.getLocalizedString("weekdayI18Nkey");
                    if(localData) {
                        return localData.split(',');
                    } else {
                        return defaultDayValues;
                    }
                } else {
                    if($KG["i18nArray"]) {
                        i18Sunday = $KG["i18nArray"]["platform.calendar.sunday"] ? kony.i18n.getLocalizedString("platform.calendar.sunday") : defaultDayValues[0];
                        localData.push(i18Sunday);
                        i18Monday = $KG["i18nArray"]["platform.calendar.monday"] ? kony.i18n.getLocalizedString("platform.calendar.monday") : defaultDayValues[1];
                        localData.push(i18Monday);
                        i18Tuesday = $KG["i18nArray"]["platform.calendar.tuesday"] ? kony.i18n.getLocalizedString("platform.calendar.tuesday") : defaultDayValues[2];
                        localData.push(i18Tuesday);
                        i18Wednesday = $KG["i18nArray"]["platform.calendar.wednesday"] ? kony.i18n.getLocalizedString("platform.calendar.wednesday") : defaultDayValues[3];
                        localData.push(i18Wednesday);
                        i18Thursday = $KG["i18nArray"]["platform.calendar.thursday"] ? kony.i18n.getLocalizedString("platform.calendar.thursday") : defaultDayValues[4];
                        localData.push(i18Thursday);
                        i18Friday = $KG["i18nArray"]["platform.calendar.friday"] ? kony.i18n.getLocalizedString("platform.calendar.friday") : defaultDayValues[5];
                        localData.push(i18Friday);
                        i18Saturday = $KG["i18nArray"]["platform.calendar.saturday"] ? kony.i18n.getLocalizedString("platform.calendar.saturday") : defaultDayValues[6];
                        localData.push(i18Saturday);
                    }
                    if(localData.length > 0) {
                        return localData;
                    } else {
                        return defaultDayValues;
                    }
                }
            }());
            calendarMonthsValues = (function() {
                var localData = [],
                    i18January, i18February, i18March, i18April, i18May, i18June, i18July, i18August, i18September, i18October, i18November, i18December, defaultMonthValues = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                if($KG["i18nArray"] && $KG["i18nArray"]["monthI18Nkey"]) {
                    localData = kony.i18n.getLocalizedString("monthI18Nkey");
                    if(localData) {
                        return localData.split(',');
                    } else {
                        return defaultMonthValues;
                    }
                } else {
                    if($KG["i18nArray"]) {
                        i18January = $KG["i18nArray"]["platform.calendar.january"] ? kony.i18n.getLocalizedString("platform.calendar.january") : defaultMonthValues[0];
                        localData.push(i18January);
                        i18February = $KG["i18nArray"]["platform.calendar.february"] ? kony.i18n.getLocalizedString("platform.calendar.february") : defaultMonthValues[1];
                        localData.push(i18February);
                        i18March = $KG["i18nArray"]["platform.calendar.march"] ? kony.i18n.getLocalizedString("platform.calendar.march") : defaultMonthValues[2];
                        localData.push(i18March);
                        i18April = $KG["i18nArray"]["platform.calendar.april"] ? kony.i18n.getLocalizedString("platform.calendar.april") : defaultMonthValues[3];
                        localData.push(i18April);
                        i18May = $KG["i18nArray"]["platform.calendar.may"] ? kony.i18n.getLocalizedString("platform.calendar.may") : defaultMonthValues[4];
                        localData.push(i18May);
                        i18June = $KG["i18nArray"]["platform.calendar.june"] ? kony.i18n.getLocalizedString("platform.calendar.june") : defaultMonthValues[5];
                        localData.push(i18June);
                        i18July = $KG["i18nArray"]["platform.calendar.july"] ? kony.i18n.getLocalizedString("platform.calendar.july") : defaultMonthValues[6];
                        localData.push(i18July);
                        i18August = $KG["i18nArray"]["platform.calendar.august"] ? kony.i18n.getLocalizedString("platform.calendar.august") : defaultMonthValues[7];
                        localData.push(i18August);
                        i18September = $KG["i18nArray"]["platform.calendar.september"] ? kony.i18n.getLocalizedString("platform.calendar.september") : defaultMonthValues[8];
                        localData.push(i18September);
                        i18October = $KG["i18nArray"]["platform.calendar.october"] ? kony.i18n.getLocalizedString("platform.calendar.october") : defaultMonthValues[9];
                        localData.push(i18October);
                        i18November = $KG["i18nArray"]["platform.calendar.november"] ? kony.i18n.getLocalizedString("platform.calendar.november") : defaultMonthValues[10];
                        localData.push(i18November);
                        i18December = $KG["i18nArray"]["platform.calendar.december"] ? kony.i18n.getLocalizedString("platform.calendar.december") : defaultMonthValues[11];
                        localData.push(i18December);
                    }
                    if(localData.length > 0) {
                        return localData;
                    } else {
                        return defaultMonthValues;
                    }
                }
            }());
        },
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel),
                dateValue, isValid, node, mode;

            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
            switch(propertyName) {
                case "date":
                    dateValue = _ideDateToString(widgetModel.date);
                    if(!dateValue) break;
                    widgetModel.entereddate = dateValue;
                    isValid = $KU.isValidDate(dateValue, "dd/mm/yyyy");
                    if(isValid) {
                        widgetModel.day = propertyValue[0];
                        widgetModel.month = propertyValue[1];
                        widgetModel.year = propertyValue[2];
                        this.updateCalDOMNode(widgetModel, element);
                    }
                    break;

                case "datecomponents":
                    widgetModel.day = propertyValue[0];
                    widgetModel.month = propertyValue[1];
                    widgetModel.year = propertyValue[2];
                    widgetModel.hour = 0; 
                    widgetModel.minutes = 0; 
                    widgetModel.seconds = 0; 
                    this.updateCalDOMNode(widgetModel, element);
                    break;

                case "placeholder":
                    node = document.getElementById(widgetModel.id);
                    if(node && (node.value.indexOf('/') > -1 || node.value.indexOf('-') > -1)) {
                        return false;
                    }
                    propertyValue = propertyValue || widgetModel.dateformat || widgetModel.format;
                    if(widgetModel.placeholder != propertyValue) {
                        widgetModel.placeholder = propertyValue;
                    }
                    node && node.setAttribute("placeholder", widgetModel.placeholder);
                    break;

                case "calendaricon":
                    if(element)
                        element.childNodes[1].src = $KU.getImageURL(propertyValue);
                    widgetModel.Image = propertyValue;
                    break;

                case "dateformat":
                    this.updateCalDOMNode(widgetModel, element);
                    break;

                case "validstartdate":
                case "startdate":
                    if(!_isValidDateComponents(widgetModel)) {
                        module.clear(widgetModel);
                    }
                    break;

                case "validenddate":
                case "enddate":
                    if(!_isValidDateComponents(widgetModel)) {
                        module.clear(widgetModel);
                    }
                    break;

                case "titleonpopup":
                    widgetModel.title = propertyValue;
                    break;

                case "selecteddates":
                    this.updateCalDOMNode(widgetModel, element);
                    break;

                case "selectiontype":
                    module.destroyCalendar();
                    module.clear(widgetModel);
                    break;

                case "gridtheme":
                    module.destroyCalendar();
                    break;
            }
        },
        
        render: function(calendarModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(calendarModel, context),
                htmlString = "",
                marginPaddding = $KW.skins.getBaseStyle(calendarModel, context),
                dateObj = {},
                kmasterObj = $KW.Utils.getMasterIDObj(calendarModel),
                id = (kmasterObj.id != "") ? kmasterObj.id : calendarModel.pf + "_" + calendarModel.id;

            if(calendarModel.viewtype === constants.CALENDAR_VIEW_TYPE_GRID_POPUP || calendarModel.viewtype === "default") {
                _initializeCalendarModel(calendarModel);
                module.updateCalDOMNode(calendarModel);
                if(context.ispercent === false) {
                    marginPaddding += " display: inline-block;"
                }
                htmlString = "<div kwidgetid='" + id + "' " + $KW.Utils.getBaseHtml(calendarModel, context) + " class='" + computedSkin + "'";
                htmlString += " style='text-align:" + $KW.skins.getContentAlignment(calendarModel) + "; vertical-align: middle;" + marginPaddding;
                htmlString += ($KU.isAndroid ? "position:relative;" : "") + (context.ispercent === false ? "display:inline-block" : "") + ";overflow:hidden'";
                if(kony.appinit.isAndroid || kony.appinit.isiPhone) {
                    htmlString += " role='option' ";
                }
                htmlString += ">";
                
                htmlString += _generateInputTagString(calendarModel, context);
                htmlString += _generateImageTagString(calendarModel, context);
                if($KU.isAndroid) { 
                    htmlString += "<div style='position:absolute;width:100%;height:100%;background:transparent;top:0;left:0'><div style='width:100%;height:100%;background:transparent;'></div></div>";
                }
                htmlString += "</div>";
            }
            return htmlString;
        },
        adjustCalendars: function(container) {
            var calElements = document.querySelectorAll("#" + container.pf + "_" + container.id + " input[name='calBody']");
            for(var i = 0; i < calElements.length; i++) {
                var calElement = calElements[i];
                module.setCalElementStyle(calElement, true);
            }
        },
        clear: function(calendarModel) {
            var calendarElement = $KU.getNodeByModel(calendarModel);
            
            
            
            calendarModel.datecomponents = [null, null, null];
            calendarModel.entereddate = null;
            calendarModel.date = null;
            calendarModel.formatteddate = null;
            calendarModel.day = null;
            calendarModel.month = null;
            calendarModel.year = null;
            calendarModel.seconds = null;
            calendarModel.minutes = null;
            calendarModel.hour = null;
            calendarModel.selecteddates = [];
            if(module.isMultiRangeCalendar(calendarModel)) {
                calendarElement = $KW.Utils.getClonedTemplateNode(calendarElement, calendarModel, "selecteddates");
            } else {
                calendarElement = $KW.Utils.getClonedTemplateNode(calendarElement, calendarModel, "datecomponents");
            }
            if(calendarElement) {
                calendarElement = calendarElement.childNodes[0];
                calendarElement.value = "";
            }
            if(!kony.utils.placeholderSupported && calendarElement) {
                calendarModel.placeholder = calendarModel.placeholder || calendarModel.dateformat || calendarModel.format;
                calendarElement.value = calendarModel.placeholder;
                $KU.addClassName(calendarElement, 'konyplaceholder');
            }
        },
        destroyCalendar: function(ele, calendarElementID, targetWidget) {
            var elements, element, main, i, mouseEvent, calendarElement;
            _removeTabIndexs();
            if(!ele) {
                elements = document.querySelectorAll("div[id$='-k-w-c-datepicker'],.k-w-c-scrim-for-popup");
                for(i = 0, l = elements.length; i < l; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                    if($KU.isIE && targetWidget) {
                        if(targetWidget.getAttribute("kwidgettype") == "CalendarText" || targetWidget.getAttribute("kwidgettype") == "TextField") {
                            targetWidget.focus();
                        }
                    }
                }
            } else {
                elements = document.querySelectorAll('.k-w-c-scrim-for-popup')[0];
                element = document.getElementById(module.active);
                element && element.parentNode.removeChild(element);
                elements && elements.parentNode.removeChild(elements);
            }
            if(module.activeCalendarNode) {
                calendarElement = module.activeCalendarNode.childNodes[0];
                calendarElement.setAttribute('tabindex', 1);
                calendarElement.focus();
            }
            module.activeCalendarNode = null;
        },
        dismiss: function(model) {
            _dismissCalendar();
        },
        displayedMonth: function(model, month, year) {
            var ser = _series(year, month, (model.noofmonths || 1) * 1 + 1),
                ele = $KU.getNodeByModel(model);
            ele = $KW.Utils.getClonedTemplateNode(ele, model);
            if(!ele) return false;
            module.destroyCalendar(1);
            model.displayedMonths = [month, year];
            _reAssignData(model);
            _show(model, ele, ser, 1);
        },
        getDat: function(date, model) {
            var format, i;
            if(!date) return;
            format = (model.dateformat || model.format).toLowerCase().replace(/^\s+|\s+$/g, '').split('/'),
                result = {};
            date = date.split('/');
            for(i = 0; i < format.length; i++) {
                result[format[i]] = date[i];
            }
            return result;
        },
        isMultiRangeCalendar: function(calendarModel) {
            if((calendarModel.viewtype === constants.CALENDAR_VIEW_TYPE_GRID_POPUP ||
                    calendarModel.viewtype === "default") &&
                (calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT ||
                    calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_MULTI_SELECT)) {
                return true;
            }
            return false;
        },
        navigateToNextMonth: function(model) {
            var mn = model.displayedMonths[0],
                yy = model.displayedMonths[1],
                ser;
            _reAssignData(model);
            if(mn == 12) {
                mn = 1;
                yy = yy + 1;
            } else {
                mn = mn + 1;
            }
            ser = _series(yy, mn, (model.noofmonths || 1));
            module.displayedMonth(model, ser[0][0], ser[0][1]);
        },
        navigateToPreviousMonth: function(model) {
            var mn = model.displayedMonths[0],
                yy = model.displayedMonths[1],
                ser;
            _reAssignData(model);
            if(mn == 1) {
                mn = 12;
                yy = yy - 1;
            } else {
                mn = mn - 1;
            }
            ser = _series(yy, mn, (model.noofmonths || 1));
            module.displayedMonth(model, ser[0][0], ser[0][1])
        },
        open: function(model) {
            var node = $KU.getNodeByModel(model);
            node = $KW.Utils.getClonedTemplateNode(node, model);
            _eventHandler(null, node);
        },
        
        setCalElementStyle: function(calendarElement, inOrientation) {
            var calendarNode, calendarModel, calendarWrapperNode, textfieldElement, imageElement, calendarNodeStyle, calendarWrapperNodeStyle, imageElementWidth, calculatedWidth, wrapperWidth, radius, _addCalendarNodeBorderRadius = function(calendarNodeStyle, textfieldElement, imageElement) {
                    var topLeftRadius, bottomLeftRadius, topRightRadius, bottomRightRadius, rightRadius, leftRadius;
                    if(calendarNodeStyle["border-top-left-radius"])
                        topLeftRadius = parseInt(calendarNodeStyle["border-top-left-radius"].substring(0, calendarNodeStyle["border-top-left-radius"].indexOf("p")));
                    if(calendarNodeStyle["border-bottom-left-radius"])
                        bottomLeftRadius = parseInt(calendarNodeStyle["border-bottom-left-radius"].substring(0, calendarNodeStyle["border-bottom-left-radius"].indexOf("p")));
                    if(calendarNodeStyle["border-top-right-radius"])
                        topRightRadius = parseInt(calendarNodeStyle["border-top-right-radius"].substring(0, calendarNodeStyle["border-top-right-radius"].indexOf("p")));
                    if(calendarNodeStyle["border-bottom-right-radius"])
                        bottomRightRadius = parseInt(calendarNodeStyle["border-bottom-right-radius"].substring(0, calendarNodeStyle["border-bottom-right-radius"].indexOf("p")));

                    if(topLeftRadius <= bottomLeftRadius) {
                        leftRadius = parseInt(bottomLeftRadius / 2);
                        textfieldElement.style.marginLeft = leftRadius + 'px';
                    } else {
                        leftRadius = parseInt(topLeftRadius / 2);
                        textfieldElement.style.marginLeft = leftRadius + 'px';
                    }

                    if(topRightRadius <= bottomRightRadius) {
                        rightRadius = parseInt(bottomRightRadius / 2);
                        imageElement.style.marginRight = rightRadius + 'px';
                    } else {
                        rightRadius = parseInt(topRightRadius / 2);
                        imageElement.style.marginRight = rightRadius + 'px';
                    }

                    return {
                        "right": rightRadius,
                        "left": leftRadius
                    };
                },
                _setFontToTextField = function(calendarNode, textFieldNode) {
                    textfieldElement.style.fontFamily = calendarNodeStyle["font-family"];
                    textfieldElement.style.fontSize = calendarNodeStyle["font-size"];
                    textfieldElement.style.color = calendarNodeStyle["color"];
                    textfieldElement.style.fontWeight = calendarNodeStyle["font-weight"];
                    textfieldElement.style.fontStyle = calendarNodeStyle["font-style"];
                };
            textfieldElement = calendarElement;
            if(!inOrientation) {
                textfieldElement = calendarElement.previousSibling;
            }
            if(!textfieldElement) return;
            calendarNode = textfieldElement.parentNode;
            calendarModel = $KU.getModelByNode(calendarNode);
            if(calendarNode.style.display != "inline-block") {
                imageElement = textfieldElement.nextSibling;
                calendarWrapperNode = calendarNode.parentNode;

                calendarNodeStyle = $KU.getComputedStyle(calendarNode);
                _setFontToTextField(calendarNodeStyle, textfieldElement)
                if(calendarModel && calendarModel.calimgheight) {
                    imageElement.style.height = calendarModel.calimgheight;
                } else {
                    imageElement.style.height = textfieldElement.clientHeight + "px";
                }
                imageElement.style.width = "auto";

                radius = _addCalendarNodeBorderRadius(calendarNodeStyle, textfieldElement, imageElement);

                if(!calendarWrapperNode) return;

                calendarWrapperNodeStyle = $KU.getComputedStyle(calendarWrapperNode);
                wrapperWidth = calendarWrapperNodeStyle.width;
                if(wrapperWidth == "100%") {
                    wrapperWidth = calendarWrapperNode.clientWidth + 'px';
                }
                wrapperWidth = parseInt(wrapperWidth.substring(0, wrapperWidth.indexOf("p")));

                imageElementWidth = $KU.getComputedStyle(imageElement).width;
                if(imageElementWidth == "auto") {
                    imageElementWidth = imageElement.clientWidth + 'px';
                } else {
                    imageElementWidth = parseInt(imageElementWidth.substring(0, imageElementWidth.indexOf("p")));
                    textfieldElement.style.width = ((wrapperWidth - (2 * imageElementWidth) - radius.left - radius.right) / wrapperWidth) * 100 + '%';

                }
            }
        },
        setcontext: function(popupModel, context) {
            if(popupModel instanceof Object && context instanceof Object) {
                popupModel.context = context;
            }
        },
        setDateSkin: function(calendarModel, dates, skin) {
            var i;
            for(i = 0, l = dates.length; i < l; i++) {
                calendarModel.specialDates = calendarModel.specialDates ? calendarModel.specialDates : {};
                if(!calendarModel.specialDates[skin]) {
                    calendarModel.specialDates[skin] = dates;
                } else {
                    calendarModel.specialDates[skin].push.apply(calendarModel.specialDates[skin], dates)
                }
            }
        },
        setEnableAll: function(calendarModel) {
            calendarModel.datesGroup = "";
            calendarModel.datesGroupSimplified = "";
        },
        setEnabled: function(calendarModel, startdate, enddate, skin, isEnable) {
            var j, value, datesAll, datesComp, from, to;
            calendarModel.datesState = (isEnable == true ? 1 : 0);
            calendarModel.datesGroupSkin = skin;
            datesAll = [];
            if(startdate && startdate.length > 0 && startdate[0] instanceof Array) {
                calendarModel.datesGroup = startdate;
                datesComp = calendarModel.datesGroup;
                for(j = 0; j < datesComp.length; j++) {
                    value = datesComp[j];
                    if(value.length == value.length) {
                        datesAll.push(new Date(value[2], value[1] - 1, value[0]).setHours(0, 0, 0, 0));
                    }
                }
            } else {
                from = new Date(startdate[2], startdate[1] - 1, startdate[0]);
                to = new Date(enddate[2], enddate[1] - 1, enddate[0]);
                datesAll.push.apply(datesAll, _between(from, to));
            }
            calendarModel.datesGroupSimplified = datesAll;
        },
        isSelectedDatesValid: function(calendarModel, value) {
            var isValidRange, isValid = false;
            if(value instanceof Array && value.length > 0) {
                if(calendarModel.selectiontype == constants.CALENDAR_SELECTION_TYPE_RANGE_SELECT) {
                    if(value.length == 2) {
                        isValidRange = _isToGtFromDate(value[0], value[1]);
                        isValid = isValidRange && _isDateEnabled(calendarModel, value);
                    }
                } else {
                    isValid = _isDateEnabled(calendarModel, value);
                }
            } else if(value == undefined || value.length == 0) {
                isValid = true;
            }
            return isValid;
        },
        setTimeInDateComponents: function(dateComponents) {
            var i;
            if(dateComponents instanceof Array) {
                for(i = 0; i < dateComponents.length; i++) {
                    if(!dateComponents[i][3]) dateComponents[i][3] = 0;
                    if(!dateComponents[i][4]) dateComponents[i][4] = 0;
                    if(!dateComponents[i][5]) dateComponents[i][5] = 0;
                }
                return dateComponents;
            }
        },
        
        updateCalDOMNode: function(calendarModel, element) {
            var dateValue = "",
                strDay = "",
                strMonth = "",
                result, calInput;
            if(module.isMultiRangeCalendar(calendarModel)) {
                dateValue = _getDisplayDate(calendarModel);
                calendarModel.formatteddate = dateValue;
                if(element) {
                    calInput = element.childNodes[0];
                    calInput.value = dateValue;
                }
            } else {
                if(!calendarModel.datecomponents) {
                    return false;
                }
                calendarModel.day = calendarModel.datecomponents[0];
                calendarModel.month = calendarModel.datecomponents[1];
                calendarModel.year = calendarModel.datecomponents[2];
                if(calendarModel.day && calendarModel.month && calendarModel.year) {
                    result = _dateFormatter(calendarModel.dateformat, [calendarModel.day, calendarModel.month, calendarModel.year]);
                    if(result != false) {
                        dateValue = result.string;
                    }
                    if(element) {
                        calInput = element.childNodes[0];
                        calInput.value = dateValue;
                    }
                    calendarModel.formatteddate = dateValue;
                    calendarModel.selectdate = strMonth + "/" + strDay + "/" + calendarModel.year;
                    calendarModel.pagedate = strMonth + "/" + calendarModel.year;
                } else {
                    calendarModel.formatteddate = dateValue;
                }
            }
        },

    };


    return module;
}());
