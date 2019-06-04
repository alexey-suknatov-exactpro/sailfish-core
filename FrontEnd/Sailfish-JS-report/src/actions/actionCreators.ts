/******************************************************************************
* Copyright 2009-2019 Exactpro (Exactpro Systems Limited)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
******************************************************************************/

import TestCase from "../models/TestCase";
import { StateActionTypes } from "./stateActions";
import Action from '../models/Action';
import { StatusType } from "../models/Status";
import Report from "../models/Report";
import { Panel } from "../util/Panel";
import Message from '../models/Message';
import { SubmittedData } from "../models/MlServiceResponse";

export const setReport = (report: Report) => (<const>{
    type: StateActionTypes.SET_REPORT,
    report
})

export const setTestCase = (testCase: TestCase) => (<const>{
    type: StateActionTypes.SET_TEST_CASE,
    testCase
})

export const resetTestCase = () => (<const>{
    type: StateActionTypes.RESET_TEST_CASE
})

export const selectAction = (action: Action) => (<const>{
    type: StateActionTypes.SELECT_ACTION,
    action
})

export const selectActionById = (actionId: number) => (<const>{
    type: StateActionTypes.SELECT_ACTION_BY_ID,
    actionId
})

export const selectMessage = (message: Message, status: StatusType = null) => (<const>{
    type: StateActionTypes.SELECT_MESSAGE,
    message,
    status
})

export const selectVerification = (messageId: number, status: StatusType = 'NA') => (<const>{
    type: StateActionTypes.SELECT_VERIFICATION,
    messageId,
    status
})

export const selectCheckpoint = (checkpointAction: Action) => (<const>{
    type: StateActionTypes.SELECT_CHECKPOINT,
    checkpointAction
})

export const selectRejectedMessageId = (messageId: number) => (<const>{
    type: StateActionTypes.SELECT_REJECTED_MESSAGE,
    messageId
})

export const switchActionsFilter = (status: StatusType) => (<const>{
    type: StateActionTypes.SWITCH_ACTIONS_FILTER,
    status
})

export const switchFieldsFilter = (status: StatusType) => (<const>{
    type: StateActionTypes.SWITCH_FIELDS_FILTER,
    status
})

export const setAdminMsgEnabled = (adminEnabled: boolean) => (<const>{
    type: StateActionTypes.SET_ADMIN_MSG_ENABLED,
    adminEnabled
})

export const setLeftPane = (pane: Panel) => (<const>{
    type: StateActionTypes.SET_LEFT_PANE,
    pane
})

export const setRightPane = (pane: Panel) => (<const>{
    type: StateActionTypes.SET_RIGHT_PANE,
    pane
})

export const setMlToken = (token: string) => (<const>{
    type: StateActionTypes.SET_ML_TOKEN,
    token: token
})

export const setSubmittedMlData = (data: SubmittedData[]) => (<const>{
    type: StateActionTypes.SET_SUBMITTED_ML_DATA,
    data: data
})

export const addSubmittedMlData = (data: SubmittedData) => (<const>{
    type: StateActionTypes.ADD_SUBMITTED_ML_DATA,
    data: data
})

export const removeSubmittedMlData = (data: SubmittedData) => (<const>{
    type: StateActionTypes.REMOVE_SUBMITTED_ML_DATA,
    data: data
})

export const setSearchString = (searchString: string) => (<const>{
    type: StateActionTypes.SET_SEARCH_STRING,
    searchString
})

export const setIsLoading = (isLoading: boolean) => (<const>{
    type: StateActionTypes.SET_IS_LOADING,
    isLoading
})
