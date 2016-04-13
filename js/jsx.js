var months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
var global = { json : {} };

if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
          enumerable: false, 
          configurable: true,
          writable: false,
          value: function (prop, handler) {
            var oldval = this[prop],
            newval = oldval,
            getter = function () {
                return newval;
            },
            setter = function (val) {
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
            };
            
            if (delete this[prop]) { 
                Object.defineProperty(this, prop, {
                      get: getter
                    , set: setter
                    , enumerable: true
                    , configurable: true
                });
            }
        }
    });
}

var csend = function(arg){
    this.serialiseObject = function(obj) {
        var pairs = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
                pairs.push(this(obj[prop]));
                continue;
            }
            pairs.push(prop + '=' + obj[prop]);
        }
        return pairs.join('&');
    }

    var xmlhttp = new XMLHttpRequest() || new ActiveXObject('Msxml2.XMLHTTP') || new ActiveXObject('Microsoft.XMLHTTP') || null;
    if(xmlhttp){
        xmlhttp.open( "GET", location.href.replace(location.search, '') + 'data.php' + location.search + '&' + this.serialiseObject(arg) , true );
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status == 304) {
                    global.json = JSON.parse(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.send(null);
    }
}


var DrawNavbar = React.createClass({
    render: function(){
        return (
            <div>
                <div className="navbar navbar-default">
                    <div className="navbar-text pull-right">[<a className="button_sand" onClick={function(){ csend({view : 'week', acion: 'logout'})}} href="logout/">{this.props.json.user} - выход</a>]
                    {(this.props.json.admin) && (
                        <a style={{marginLeft:'10px'}} onClick={ function(){ csend({action: this.props.json.view=='nav' ? 'members':'nav' }) }.bind(this) }>{this.props.json.view=='nav' ? 'пользователи':'подразделения'}</a>
                    )}
                    </div>
                    <h3 className="navbar-text" style={{cursor: 'pointer'}} onClick={ function(){ csend({action:'nav', id:1}) }}>Графики отпусков</h3>
                </div>
                <div className="col-md-12 clearfix">
                    {this.props.children}
                    <div className="clearfix"></div>
                </div>
            </div>
        );
    }
});


var DrawCalendar = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            showEdit: nextProps.showEdit,
            closed: true,
            confirm: false,
        });
    },
    componentDidMount: function() {
        document.body.addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 27){
                this.setState({ 
                    showEdit: false,
                    closed: true,
                });
            }
          }.bind(this));
    },
    getInitialState: function() {
        return { 
            showEdit: false,
            closed: true,
            confirm: false,
            text: '',
            id: 0,
            user: '',
            index: 0,
        };
    },    
    render: function(){
        var thead = [], rows = [], cols = [];

        cols.push(<td className="header"><b>Сотрудник</b></td>);
        var syear = this.props.json.year;

        for (month=1; month<=12; month++){
            var days_in_this_month = date("t", mktime(0, 0, 0, month, 1, syear));
            var current_month_name = months[(month-1)];
            
            var colweeks = 0;
            var week_day = 0;
            
            for (day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
                week_day = Math.floor(date("N", mktime(0, 0, 0, month, day_counter, syear)));
                if (week_day == 7) colweeks++;
            }
            
            if(week_day > 1 && week_day < 3) colweeks++;
            //if (month==12) colweeks++;
            
            cols.push(<th className="header" colSpan={colweeks}><b>{current_month_name}</b></th>);
        }

        thead.push(<tr>{cols}</tr>);

        var syear = this.props.json.year;

        for(user in this.props.json.rows){
            cols = [];
            var username = this.props.json.graph_users[user];
            cols.push(<th className="b-vacations__user">
                <span data-username={username} data-user={user} className="b-vacations__user-remove" onClick={ 
                    function(e){
                        var user = e.target.getAttribute('data-user');
                        var username = e.target.getAttribute('data-username');
                        var index = this.props.json.index;
                        this.setState({
                            text: 'Удалить пользователя ' + username + '?',
                            confirm: true,
                            func: function(){
                                csend({ deletepeople: 1, member: user, otdel: index, unit: username, index: index});
                            }
                        })                        
                    }.bind(this)
                }></span>
                <span className="b-vacations__user-text">{username}</span>
            </th>);
            
            
            var first = 0;
            for(month=1; month<=13; month++){
                var days_in_this_month = Math.floor(date("t", mktime(0, 0, 0, (month==13 ? 1 : month), 1, (month==13 ? syear + 1 : syear))));
                var colweeks = 0;
                
                for(var day_counter = 1; day_counter <= (month==13 ? 6 : days_in_this_month); day_counter++) {
                    var week_day = date("N", mktime(0, 0, 0, month, day_counter, syear));
                    if(week_day == 7){
                        var dtid = user + "_" + (month==13 ? syear + 1 : syear) + "_" + (month==13 ? 1 : month) + "_" + colweeks;
                        var data = this.props.json.rows[user][dtid] ? this.props.json.rows[user][dtid] : null;
                        
                        var datetooltip = this.props.json.graph_users[user] + ' ' + (((first > day_counter)? months[month-2] : ((first == 0) ? months[11]:months[month-1])) + " " + ((first == 0) ? 32-(7-day_counter):first) + " - " + (months[(month-1)] || '') + " " + day_counter);
                        cols.push(<td className={'sc' + ((data!=null)? ' active':'')} data-tooltip={datetooltip} data-text={data} data-id={dtid} data-user={user} onClick={function(e){
                            this.setState({ showEdit: true, text: e.target.getAttribute('data-text'), id: e.target.getAttribute('data-id'), user: e.target.getAttribute('data-user'), index: this.props.json.index })
                        }.bind(this)}></td>);
                        
                        
                        colweeks++;
                        first = ((day_counter == days_in_this_month) ? 1 : day_counter+1);
                    }
                    week_day++;
                }
            }
            rows.push(<tr>{cols}</tr>);
        }

        return (
            <div className="panel panel-default">
                <table className="table table-bordered table-hover">
                    <thead>{thead}</thead>
            	    <tbody>{rows}</tbody>
            	</table>
                <DrawMsgbox closed={!this.state.showEdit} text={this.state.text} id={this.state.id} isEditable={true} user={this.state.user} index={this.state.index} />
                <DrawConfirm text={this.state.text} json={this.props.json} func={this.state.func} closed={!this.state.confirm} />
            </div>
        );
    }
})

var DrawConfirm = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            closed: nextProps.closed,
            text: nextProps.text || '',
            func: nextProps.func || function(){},
        });
    },
    getInitialState: function() {
        return { 
            closed: true,
            text: '',
            func: function(){},
        };
    },
    handleOk: function(event){
        this.props.func.apply(this, arguments);
        this.setState({ closed: true });
    },
    handleClose: function(event){
        this.setState({ closed: true });
    },
    render: function(){
        return (
            <div>
                {(!this.state.closed) && (
                    <div style={{ display:'block', position: 'fixed', top:0, left:0, right:0, bottom:0, zIndex: 1000}}>
                        <div className="panel panel-default" style={{ width: '500px', margin: '15% auto 0 auto', boxShadow: '0px 0px 45px rgba(0,0,0,.3)'}}>
                            <div className="panel-heading clearfix">
                                <div className="remove" style={{height:'20px'}} onClick={this.handleClose}></div>
                            </div>
                            <div className="panel-body">
                                <div className="clearfix well">
                                    {this.state.text}
                                </div>
                                <div className="pull-right">
                                    <button className="btn btn-primary" onClick={this.handleOk} style={{marginRight: '5px'}} autoFocus>Ок</button>
                                    <button className="btn btn-primary" onClick={this.handleClose}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
});

var DrawMsgbox = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            closed: nextProps.closed,
            text: nextProps.text || '',
            isEditable: true,
            user: nextProps.user || '',
            id: nextProps.id || 0,
            index: nextProps.index || 0,
        });
    },
    getInitialState: function() {
        return { 
            closed: true,
            text: '',
            isEditable: true,
        };
    },
    handleText: function(event){
        this.setState({
            text: event.target.value,
        });
    },
    handleSave: function(event){
        csend({ storage:1, id_graph:this.state.id, unit: this.state.user, data: this.state.text, index: this.state.index });
        this.setState({ closed: true });
    },
    handleClose: function(event){
        this.setState({ closed: true });
    },
    render: function(){
        return (
            <div>
                {(!this.state.closed) && (
                    <div style={{ display:'block', position: 'fixed', top:0, left:0, right:0, bottom:0, zIndex: 1000}}>
                        <div className="panel panel-default" style={{ width: '500px', margin: '15% auto 0 auto', boxShadow: '0px 0px 45px rgba(0,0,0,.3)'}}>
                            <div className="panel-heading clearfix">
                                <div className="remove" style={{height:'20px'}} onClick={this.handleClose}></div>
                            </div>
                            <div className="panel-body">
                                <div className="form-group">
                                    <textarea size="200" className="form-control" rows="5" value={this.state.text} onChange={this.handleText} autoFocus={true} style={{resize:"none"}}></textarea>
                                </div>
                                <div className="pull-right">
                                    <button className="btn btn-primary" onClick={this.handleSave} style={{marginRight: '5px'}}>Ок</button>
                                    <button className="btn btn-primary" onClick={this.handleClose}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
});

var DrawListItem = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            confirm: false,
            edit: false,
        });
    },
    componentDidMount: function() {
        document.body.addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 27){
                this.setState({ 
                    confirm: false,
                });
            }
          }.bind(this));
    },
    getInitialState: function() {
        return { 
            confirm: false,
            func: function(){},
            edit: false,
            name: this.props.name,
        };
    },
    componentDidUpdate: function() {
        if(this.state.edit){
            this.getDOMNode().querySelector('input').focus();
        }
    },
    handleSave: function(){
        if(this.state.edit && this.state.name != this.props.name && this.state.name != ''){
            csend({ action:'edit_otdel', otdel_id:this.props.id, editname:this.state.name });
        }else{
            this.setState({ name: this.props.name });
        }
        this.setState({ edit: !this.state.edit, confirm: false });
    },
    handleDelete: function(){
        this.setState({ 
            confirm: true, 
            func: function(){
                csend({action: 'delete_otdel', otdel_id: this.props.id, pid: this.props.pid });
                this.setState({
                    confirm: false
                });
            }.bind(this), 
            text: 'Вы хотите удалить отдел "' + this.props.name + '"?',
        });
    },
    render: function(){
        return (
            <div className={'bheader list-group-item link' + (this.props.childs ? ' list-group-item-info':'')} style={{cursor: 'pointer'}}>
                {( this.props.json.admin) && (
                    <div>
                        <span className="remove" onClick={this.handleDelete}></span>
                        <span className="edit" onClick={this.handleSave}></span>
                        {(this.props.name == 'Новый отдел') && (
                            <span className="b-vacations__item-warning b-vacations__tooltip" data-tooltip="Измените название отдела!"></span>
                        )}
                    </div>
                )}
                <div style={{marginRight:'80px'}}>
                    <input type='text' style={{ display:((this.state.edit)?'block':'none'), transition:'all .2s linear'}} id={'editname' + this.props.id} className="form-control" name='editname' value={this.state.name} 
                    onChange={ function(e){ this.setState({name: e.target.value, edit: true}) }.bind(this)}
                    onKeyUp={function(e){ 
                        var intKey = (window.Event) ? e.which : e.keyCode;
                        if(intKey == 27 || intKey == 13){
                            this.handleSave();
                        }                
                    }.bind(this)} />
                    <div className="form-control" style={{border:'none', background: 'none', boxShadow: 'none', display:((this.state.edit)?'none':'block'), transition:'all .2s linear'}} 
                    onClick={ function(){ csend({ action:'nav', id:this.props.id, pid:this.props.id }) }.bind(this) }>
                        {(this.props.graph) && ( <img src="img/graph_icon.gif" style={{marginRight: '10px'}} /> )}
                        {this.props.name}
                    </div>
                </div>
                <DrawConfirm text={this.state.text} func={this.state.func} closed={!this.state.confirm} />
            </div>
        );
    }
});

var DrawWiev = React.createClass({
    render: function(){
        return (
            <div>
                <div className="clearfix">
                    <div className="pull-right">
                        {(this.props.json.admin) &&(
                            <div>
                                {(this.props.json.id!=1) && (
                                    <div style={{paddingBottom:'.4em', display:'inline-block'}}>
                                        <div className={'checkbox' + ((this.props.json.graph==1) ? ' on':'')} onClick={function(){ csend({action:'toggle', id:this.props.json.id, checkvalue: this.props.json.graph }) }.bind(this)}>
                                            <div>&nbsp;</div>
                                            <img src='img/graph_icon.gif' style={{marginRight: '10px'}} />
                                        </div>
                                    </div>
                                )}
                                <button className='btn btn-primary' onClick={function(){csend({ otdel_id: this.props.json.id, action:'new_otdel'}) }.bind(this) }>Добавить отдел</button>
                            </div>
                        )}
                    </div>
                </div>
                
				<div className="form-group">
					{(this.props.json.id!=1) && (
					    <ol className="breadcrumb">
					        {this.props.json.breadcrumbs.reverse().map(function(value){
					            return (<li><a onClick={function(){ csend({action:'nav', id:value.id }) }}>{value.text}</a></li>);
					        })}
					    </ol>
					)}
				</div>
                
                <div className='list-group'>
	                {this.props.json.otdels.map(function(otdel){
	                    return (
                            <DrawListItem graph={otdel.graph} name={otdel.name} id={otdel.id} pid={otdel.pid} childs={otdel.childs} json={this.props.json} />
	                    );
	                }, this)}
                </div>
                
                {(this.props.json.graph==1) && (
                    <div className="well">
                        {(this.props.json.index && this.props.json.index != 1) && (
                            <div>
                                <div className="clearfix">
                                    <div className="clearfix form-group">
                                        <div className="btn-group pull-right">
                                            <button className='btn btn-primary' onClick={ function(){ csend({year:-1,index:this.props.json.index }) }.bind(this) }>&larr;</button>
                                            <button className='btn btn-primary' onClick={ function(){ csend({year:(new Date().getFullYear() - this.props.json.year), index:this.props.json.index }) }.bind(this) }>текущий год</button>
                                            <button className='btn btn-primary' onClick={ function(){ csend({year:1,index:this.props.json.index }) }.bind(this) }>&rarr;</button>
                                        </div>
                                        <h3 style={{ marginTop : '0px' }}>{this.props.json.year} г.</h3>
                                    </div>
                                    <DrawCalendar json={this.props.json} />
                                </div>
                                {(this.props.json.admin) && (
                                    <div className="well">
                                        <div className="col-md-6">
                                            <h5>Редакторы:</h5>
                                            <div className="form-group">
                                                { Object.keys(this.props.json.graph_editors).map(function(key){
                                                    return (
                                                        <div style={{ cursor:'default', display: 'inline-block', borderRadius: '5px', backgroundColor: '#aaa', padding: '1px 6px', margin: '0px 1px', textShadow: '1px 1px 0px #ccc'}}>
                                                            {(this.props.json.admin) && (
                                                                <span>
                                                                    <span style={{ float:'right', cursor: 'pointer'}} onClick={ function(){ csend({deletemember:1, member:key, otdel:this.props.json.index, index: this.props.json.index }) }.bind(this) }>&times;</span>
                                                                    <div style={{fontSize: '12px', marginRight:'15px'}}>{this.props.json.graph_editors[key]}</div>
                                                                </span>
                                                            ) || (
                                                                <span>{value}</span>
                                                            )}
                                                        </div>
                                                    );
                                                }, this)}
                                            </div>
                                            <div className="form-group">
                                        	    <select id='selectmember' className="form-control col-md-9 input-sm" style={{width:'150px'}}>
                                    	            <option value='0'>&nbsp;</option>
                                    	            {Object.keys(this.props.json.editors).map(function(id){
                                    	                return (<option value={id}>{this.props.json.editors[id]}</option>);
                                    	            }, this)}
                                        	    </select>
                                            </div>
                                            <button style={{ marginLeft: '10px'}} className="btn btn-primary btn-sm" onClick={ function(){ csend({setmember:1, member: document.getElementById('selectmember').value, unit: document.getElementById('selectmember').options[document.getElementById('selectmember').selectedIndex].text, otdel:this.props.json.index }) }.bind(this) }>Добавить</button>
                                        </div>
                                        <div className="text-right col-md-6">
                                            <div className="navbar-form">
                                                <div className="form-group">
                                                    <input id='unitname' type='text' className="form-control input-sm" />
                                                </div>
                                                <button style={{ marginLeft: '10px'}} className="btn btn-primary btn-sm" onClick={ function(){ csend({add:1, unit: document.getElementById('unitname').value, index: this.props.json.id }); document.getElementById('unitname').value = ''; }.bind(this)}>Добавить</button>
                                            </div>
                                        </div>
                                        <div className="clearfix"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    },
});

var DrawMembers = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            confirm: false,
            member: nextProps.member,
        });
    },
    componentDidMount: function() {
        document.body.addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 27){
                this.setState({ 
                    confirm: false,
                });
            }
          }.bind(this));
    },
    getInitialState: function() {
        return { 
            confirm: false,
            func: function(){},
        };
    },
    handleDelete: function(e){
        var member = this.props.json.members.filter(function(m){ return m.id == e.target.getAttribute('data-member') })[0];
        if(member){
            this.setState({
                confirm: true, 
                func: function(){
                    csend({action:'delete_member', member_id: member.id});
                    this.setState({
                        confirm: false
                    });
                }.bind(this), 
                text: 'Вы хотите удалить пользователя "' + member.name + '"?',
            });
        }
    },
    handleSearch: function(e){
        this.setState({
            searchtext: e.target.value,
        });
    },
    render: function(){
        return (
            <div>
                <label htmlFor="user_list">Список пользователей</label>
                <div className="well">
                    {(this.props.json.admin) && (
                        <div className="pull-right form-inline">
                            <div className="form-group">
                                <input id='nametext' type='text' className="form-control" style={{marginRight:'10px'}} />
                            </div>
                            <button className="btn btn-primary" onClick={ function(){ csend({action:'add_member', name: document.getElementById('nametext').value }); document.getElementById('nametext').value = ''; } }>Добавить</button>
                        </div>
                    )}
                    <div style={{marginRight:'50%'}}>
                        <input id="user_list" type="text" className="form-control" placeholder="поиск по имени пользователя" value={this.state.searchtext} onChange={this.handleSearch} />
                    </div>
                </div>
                <div className="panel panel-default">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th width="1%"><b>#</b></th>
                                <th width="20%"><b>Имя</b></th>
                                <th width="80%"><b>Модератор отдела</b></th>
                                <th colSpan="2"><b>Доступ</b></th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.props.json.members.map(function(member, i){
                            if(member.name.match(this.state.searchtext)){
                                return (
                                    <tr>
                                        <td>{i+1}</td>
                                        <td><b>{member.name}</b></td>
                                        <td className="text-muted">{(member.access==1) && 'Все отделы' || member.otdels_edit.join(', ')}</td>
                                        <td>
                                            <select onChange={ function(e){ csend({ action:'access_member', member_id:member.id, accessval: e.target.value}) }.bind(this)}>
                                                <option value="0"></option>
                                                <option value="2" selected={member.access==2}>Редактор</option>
                                                <option value="1" selected={member.access==1}>Администратор</option>
                                            </select>
                                        </td>
                                        <td>
                                            {(this.props.json.admin) && (
                                                <div className="remove pull-right" style={{height:'20px'}} data-member={member.id} onClick={this.handleDelete} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        }, this)}
                        </tbody>
                    </table>
                </div>
                <DrawConfirm text={this.state.text} func={this.state.func} closed={!this.state.confirm} />
            </div>
        );
    }
});

var MainApp = React.createClass({
    getInitialState: function() {
        return { 
            newval: {},
        };
    },
    componentWillMount: function() {
        global.watch('json', function(sender, oldval, newval){
            this.setState({
                newval: newval
            })      
        }.bind(this));
    },
    render: function() {
        if (!this.state.newval) return;

        console.log((new Date).getTime())

        return (
            <DrawNavbar json={this.state.newval}>
                {(this.state.newval.view == 'nav') && (
                    <DrawWiev json={this.state.newval} />
                )}
                {(this.state.newval.view == 'members') && (
                    <DrawMembers json={this.state.newval} />
                )}
            </DrawNavbar>
        );
    },
})


csend({action:'nav', id: 1});
React.render( <MainApp />,  document.getElementById('content') );