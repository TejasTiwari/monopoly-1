from django.contrib.auth.models import Userfrom monopoly.models import Profilefrom monopoly.core.game import *from monopoly.ws_handlers.modal_title_enum import *from channels import Groupimport jsondecisions = {}def ws_connect_for_game(message, rooms, games):    username = message.user.username    path = message.content['path']    fields = path.split('/')    hostname = fields[-1]    Group(hostname).add(message.reply_channel)    game = games[hostname]    players = game.get_players()    profiles = rooms[hostname]    cash_change = []    pos_change = []    for player in players:        cash_change.append(player.get_money())        pos_change.append(player.get_position())    # wait for decision    if decisions.has_key(hostname):        wait_decision = "true"        decision = decisions[hostname].beautify()        next_player = game.get_current_player().get_index()        title_type = ModalTitleType()        decision_type = decisions[hostname].move_result_type        title = title_type.get_description(decision_type)    else:        wait_decision = "false"        decision = None        next_player = game.get_current_player().get_index()        title = None    message.reply_channel.send({        "text": build_init_msg(profiles, cash_change, pos_change, wait_decision, decision, next_player, title)    })def handle_roll(hostname, games):    game = games[hostname]    players = game.get_players()    # player_num = len(players)    steps, move_result = game.roll()    curr_player = game.get_current_player().get_index()    new_pos = game.get_current_player().get_position()    is_option = "false"    is_cash_change = "false"    new_event = "true"    curr_cash = []    next_player = None    if move_result.move_result_type == MoveResultType.CONSTRUCTION_OPTION \            or move_result.move_result_type == MoveResultType.BUY_LAND_OPTION:        decisions[hostname] = move_result        is_option = "true"    elif move_result.move_result_type == MoveResultType.PAYMENT \            or move_result.move_result_type == MoveResultType.REWARD:        game.make_decision(move_result)        next_player = game.get_current_player().get_index()        is_cash_change = "true"        for player in players:            curr_cash.append(player.get_money())    elif move_result.move_result_type == MoveResultType.NOTHING:        game.make_decision(move_result)        next_player = game.get_current_player().get_index()        new_event = "false"    else:        game.make_decision(move_result)        next_player = game.get_current_player().get_index()    title_type = ModalTitleType()    title = title_type.get_description(move_result.move_result_type)    Group(hostname).send({        "text": build_roll_res_msg(curr_player, steps, move_result.beautify(), is_option, is_cash_change,                                   new_event, new_pos, curr_cash, next_player, title)    })def handle_confirm_decision(hostname, games):    game = games[hostname]    curr_player = game.get_current_player().get_index()    decision = decisions[hostname]    del decisions[hostname]    decision.set_decision(True)    confirm_result = game.make_decision(decision)    players = game.get_players()    curr_cash = []    next_player = game.get_current_player().get_index()    for player in players:        curr_cash.append(player.get_money())    if confirm_result.move_result_type == MoveResultType.BUY_LAND_OPTION:        tile_id = confirm_result.get_land().get_position()        Group(hostname).send({            "text": build_buy_land_msg(curr_player, curr_cash, tile_id, next_player)        })    elif confirm_result.move_result_type == MoveResultType.CONSTRUCTION_OPTION:        tile_id = confirm_result.get_land().get_position()        build_type = confirm_result.get_land().get_content().get_property()        if build_type == BuildingType.HOUSE:            build_type = "house"        else:            build_type = "hotel"        Group(hostname).send({            "text": build_construct_msg(curr_cash, tile_id, build_type, next_player)        })def handle_cancel_decision(hostname, games):    game = games[hostname]    decision = decisions[hostname]    del decisions[hostname]    decision.set_decision(False)    game.make_decision(decision)    next_player = game.get_current_player().get_index()    Group(hostname).send({        "text": build_cancel_decision_msg(next_player)    })def handle_chat(hostname, msg):    sender = msg["from"]    content = msg["content"]    Group(hostname).send({        "text": build_chat_msg(sender, content)    })def build_init_msg(players, cash_change, pos_change, wait_decision, decision, next_player, title):    players_list = []    for player in players:        profile_user = User.objects.get(username=player)        try:            profile = Profile.objects.get(user=profile_user)        except Exception:            profile = None        avatar = profile.avatar.url if profile else ""        players_list.append({"fullName": profile_user.first_name + " " + profile_user.last_name,                     "userName": profile_user.username, "avatar": avatar})    ret = {"action": "init",           "players": players_list,           "changeCash": cash_change,           "posChange": pos_change,           "waitDecision": wait_decision,           "decision": decision,           "nextPlayer": next_player,           "title": title,           }    print json.dumps(ret)    return json.dumps(ret)def build_roll_res_msg(curr_player, steps, result, is_option, is_cash_change, new_event,                       new_pos, curr_cash, next_player, title):    ret = {"action": "roll_res",           "curr_player": curr_player,           "steps": steps,           "result": result,           "is_option": is_option,           "is_cash_change": is_cash_change,           "new_event": new_event,           "new_pos": new_pos,           "curr_cash": curr_cash,           "next_player": next_player,           "title": title,            }    print json.dumps(ret)    return json.dumps(ret)def build_buy_land_msg(curr_player, curr_cash, tile_id, next_player):    ret = {"action": "buy_land",           "curr_player": curr_player,           "curr_cash": curr_cash,           "tile_id": tile_id,           "next_player": next_player,    }    print json.dumps(ret)    return json.dumps(ret)def build_construct_msg(curr_cash, tile_id, build_type, next_player):    ret = {"action": "construct",           "curr_cash": curr_cash,           "tile_id": tile_id,           "build_type": build_type,           "next_player": next_player,           }    print json.dumps(ret)    return json.dumps(ret)def build_cancel_decision_msg(next_player):    ret = {"action": "cancel_decision",           "next_player": next_player,    }    print json.dumps(ret)    return json.dumps(ret)def build_pass_start_msg(curr_player):    ret = {"action": "pass_start",           "curr_player": curr_player,          }    print json.dumps(ret)    return json.dumps(ret)def build_chat_msg(sender, content):    ret = {"action": "chat",           "sender": sender,           "content": content,    }    print json.dumps(ret)    return json.dumps(ret)