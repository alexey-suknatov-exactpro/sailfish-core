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

import * as React from 'react';
import Action, { ActionNode, ActionNodeType } from '../../models/Action';
import { ActionCard } from './ActionCard';
import UserMessage from '../../models/UserMessage';
import Verification from '../../models/Verification'
import Link from '../../models/Link';
import { StatusType } from '../../models/Status';
import UserTable from '../../models/UserTable';
import { CustomMessage } from './CustomMessage';
import Tree, { createNode } from '../../models/util/Tree';
import { connect } from 'react-redux';
import AppState from '../../state/models/AppState';
import { CheckpointAction } from '../Checkpoint';
import { isCheckpoint } from '../../helpers/actionType';
import { selectAction } from '../../actions/actionCreators';
import { selectVerification } from '../../actions/actionCreators';
import VerificationCard from './VerificationCard';
import UserTableCard from './UserTableCard';
import '../../styles/action.scss';
import { raf } from '../../helpers/raf';

interface ActionTreeOwnProps {
    action: ActionNode;
    onExpand: () => void;
}

interface ActionTreeStateProps {
    selectedVerififcationId: number;
    selectedActionsId: number[];
    scrolledActionId: Number;
    actionsFilter: StatusType[];
}

interface ActionTreeDispatchProps {
    actionSelectHandler: (action: Action) => any;
    messageSelectHandler: (id: number, status: StatusType) => any;
}

interface ActionTreeProps extends ActionTreeOwnProps, ActionTreeStateProps, ActionTreeDispatchProps {}

class ActionTreeBase extends React.Component<ActionTreeProps> {

    private expandedTreePath: Tree<number> = null;
    private treeElements: JSX.Element[] = [];

    componentWillMount() {
        this.updateTreePath(this.props.action, this.props.selectedActionsId);
    }

    // scrolling to action, selected by url sharing
    componentDidMount() {
        if (!this.treeElements[+this.props.scrolledActionId]) {
            return;
        }

        // https://stackoverflow.com/questions/26556436/react-after-render-code/28748160#comment64053397_34999925
        // At his point (componentDidMount) DOM havn't fully rendered, so, we calling RAF twice:
        // At this point React passed components tree to DOM, however it still could be not redered.
        // First callback will be called before actual render
        // Second callback will be called when DOM is fully rendered.
       raf(() => {
            this.scrollToAction(+this.props.scrolledActionId);
        }, 2);
    }

    componentWillReceiveProps(nextProps: ActionTreeProps) {
        // handling action change to update expand tree
        if (this.props.action !== nextProps.action) {
            this.updateTreePath(this.props.action, this.props.selectedActionsId);
        } else {
            this.expandedTreePath = null;
        }
    }

    componentDidUpdate(prevProps: ActionTreeProps) {
        // reference comparison works here because scrolledActionId is a Number object 
        if (prevProps.scrolledActionId != this.props.scrolledActionId) {
            this.scrollToAction(+this.props.scrolledActionId);
        }
    }

    shouldComponentUpdate(nextProps: ActionTreeProps) {
        if (nextProps.action !== this.props.action) return true;

        if (nextProps.action.actionNodeType === ActionNodeType.ACTION) {
            const nextAction = nextProps.action as Action;

            if (this.props.actionsFilter !== nextProps.actionsFilter) {
                return true;
            }

            // compare current action id and selected action id
            return this.shouldActionUpdate(nextAction, nextProps, this.props);
        } else {
            return true;
        }
    }

    shouldActionUpdate(action: Action, nextProps: ActionTreeProps, prevProps: ActionTreeProps): boolean {

        // hadnling scrolled action change
        if (nextProps.scrolledActionId != prevProps.scrolledActionId && action.id === +nextProps.scrolledActionId) {
            return true;
        }

        // the first condition - current action is selected and we should update to show it
        // the second condition - current action was selected and we should disable selection
        if (nextProps.selectedActionsId != prevProps.selectedActionsId && (
                nextProps.selectedActionsId.includes(action.id) || prevProps.selectedActionsId.includes(action.id))) {
            return true;
        }

        // here we check verification selection
        if (nextProps.selectedVerififcationId !== prevProps.selectedVerififcationId &&
            action.relatedMessages &&
            (action.relatedMessages.some(msgId => msgId == nextProps.selectedVerififcationId || msgId == prevProps.selectedVerififcationId))) {
            return true;
        }

        if (action.subNodes) {
            // if at least one of the subactions needs an update, we update the whole action
            return action.subNodes.some(action => {
                if (action.actionNodeType === ActionNodeType.ACTION) {
                    return this.shouldActionUpdate(action as Action, nextProps, prevProps)
                } else {
                    return false;
                }
            });
        }

        return false;
    }

    updateTreePath(action: ActionNode, targetActionsId: number[]) {
        if (action.actionNodeType == ActionNodeType.ACTION) {
            this.expandedTreePath = this.getExpandedTreePath(action as Action, targetActionsId);
        } else {
            this.expandedTreePath = null;
        }
    }

    getExpandedTreePath(action: Action, targetActionsId: number[]): Tree<number> {

        const treeNode = createNode(action.id);

        if (action.subNodes) {
            action.subNodes.forEach(actionNode => {
                if (actionNode.actionNodeType == ActionNodeType.ACTION) {
                    const subNodePath = this.getExpandedTreePath(actionNode as Action, targetActionsId);

                    subNodePath && treeNode.nodes.push(subNodePath);
                }
            })
        }

        // checking wheather the current action is the one of target acitons OR some of action's sub nodes is the target aciton
        return targetActionsId.includes(action.id) || treeNode.nodes.length != 0 ? 
                treeNode : 
                null;
    }

    getSubTree(action: ActionNode, expandTree: Tree<number>): Tree<number> {
        if (action.actionNodeType == ActionNodeType.ACTION) {
            return expandTree && expandTree.nodes.find(subNode => subNode.value == (action as Action).id);
        } else {
            return null;
        }
    }

    scrollToAction(actionId: number) {
        if (this.treeElements[actionId]) {
            //this.treeElements[actionId].base.scrollIntoView({ block: 'center' });
        }
    }

    render(): JSX.Element {
        return this.renderNode(this.props, true, this.expandedTreePath);
    }

    renderNode(props: ActionTreeProps, isRoot = false, expandTreePath: Tree<number> = null, parentAction: Action = null): JSX.Element {
        const { actionSelectHandler, messageSelectHandler, selectedActionsId, selectedVerififcationId: selectedMessageId, actionsFilter, onExpand } = props;

        switch (props.action.actionNodeType) {
            case ActionNodeType.ACTION: {
                const action = props.action as Action;

                if (isCheckpoint(action)) {
                    return (
                        <CheckpointAction
                            action={action}/>
                    );
                }

                // we need to use undefined here to prevent closing action card when it not included in current tree path 
                const isExpanded = expandTreePath ? expandTreePath.value == action.id : undefined;

                return (
                    <ActionCard action={action}
                        isSelected={selectedActionsId.includes(action.id)}
                        isTransaparent={!actionsFilter.includes(action.status.status)}
                        onSelect={actionSelectHandler}
                        isRoot={isRoot}
                        isExpanded={isExpanded}
                        onExpand={onExpand}
                        ref={ref => this.treeElements[action.id] = ref}>
                        {
                            action.subNodes ? action.subNodes.map(
                                childAction => this.renderNode(
                                    { ...props, action: childAction },
                                    false, 
                                    this.getSubTree(childAction, expandTreePath),
                                    action
                                )) : null
                        }
                    </ActionCard>
                );
            }

            case ActionNodeType.CUSTOM_MESSAGE: {
                const messageAction = props.action as UserMessage;

                if (!messageAction.message && !messageAction.exception) {
                    return <div/>;
                }

                return (
                    <CustomMessage
                        userMessage={messageAction}
                        parent={parentAction}
                        onExpand={onExpand}/>
                );
            }

            case ActionNodeType.VERIFICATION: {
                const verification = props.action as Verification;
                const isSelected = verification.messageId === selectedMessageId;
                const isTransparent = !actionsFilter.includes(verification.status.status);

                return (
                    <VerificationCard
                        key={verification.messageId}
                        verification={verification}
                        isSelected={isSelected}
                        isTransparent={isTransparent}
                        onSelect={messageSelectHandler}
                        parentActionId={parentAction && parentAction.id}
                        onExpand={onExpand}/>
                )
            }

            case ActionNodeType.LINK: {
                const { link } = props.action as Link;

                return (
                    <div className="action-card">
                        <h3>{"Link : " + link}</h3>
                    </div>
                );
            }

            case ActionNodeType.TABLE: {
                const table = props.action as UserTable;

                return (
                    <UserTableCard
                        table={table}
                        parent={parentAction}
                        onExpand={onExpand}/>
                );
            }

            default: {
                console.warn("WARNING: unknown action node type");
                return <div></div>;
            }
        }
    }
}

export const ActionTree = connect(
    (state: AppState, ownProps: ActionTreeOwnProps): ActionTreeStateProps => ({
        selectedVerififcationId: state.selected.verificationId,
        selectedActionsId: state.selected.actionsId,
        scrolledActionId: state.selected.scrolledActionId,
        actionsFilter: state.filter.actionsFilter
    }),
    (dispatch, ownProps: ActionTreeOwnProps): ActionTreeDispatchProps => ({
        actionSelectHandler: action => dispatch(selectAction(action)),
        messageSelectHandler: (id, status) => dispatch(selectVerification(id, status))
    })
)(ActionTreeBase);
