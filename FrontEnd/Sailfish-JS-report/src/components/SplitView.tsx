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
import '../styles/splitter.scss';
import { createSelector } from '../helpers/styleCreators';

const SPLITTER_WIDTH = 25;

/**
 * Props for splitter component
 */
export interface SplitViewProps {
    /**
     * Min precentage width for all panels 
     */
    minPanelPercentageWidth: number;
    
    /**
     * (optional) Resize event handler, recieves left and right widths in px.
     */
    resizeHandler?: (leftPanelWidth: number, rightPanelWidth: number) => any; 

    /**
     * Panel for compoentns : first child - for left panel, second child - for right panel, other childs will be ignored
     */
    children: JSX.Element[];
}

interface SplitState {
    leftPanelWidth: number;
    isDragging: boolean;
}

export class SplitView extends React.Component<SplitViewProps, SplitState> {

    private rightPanel : HTMLElement;
    private leftPanel : HTMLElement;
    private root : HTMLElement;
    private splitter : HTMLElement;
    private lastPosition : number;

    constructor(props) {
        super(props);
        this.state = {
            leftPanelWidth: 0,
            isDragging: false
        };
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    componentDidMount() {
        if (this.root) {
            this.setState({
                ...this.state,
                leftPanelWidth: this.root.offsetWidth / 2
            });
        }
    }

    componentDidUpdate(prevProps: SplitViewProps, prevState: SplitState) {
        if (this.state.leftPanelWidth != prevState.leftPanelWidth && this.props.resizeHandler) {
            this.props.resizeHandler(this.leftPanel.offsetWidth, this.rightPanel.offsetWidth);
        }
    }
    
    splitterMouseDown(e: React.MouseEvent) {
        this.root.addEventListener("mousemove", this.onMouseMove);
        this.root.addEventListener("mouseleave", this.onMouseUpOrLeave)
        this.root.addEventListener("mouseup", this.onMouseUpOrLeave)
        this.lastPosition = e.clientX;
        this.splitter.style.left = this.leftPanel.scrollWidth.toString() + 'px';

        this.setState({
            ...this.state, 
            isDragging: true
        }) 
    }

    onMouseUpOrLeave = (e: MouseEvent) => {
        this.root.removeEventListener("mouseleave", this.onMouseUpOrLeave);
        this.root.removeEventListener("mouseup", this.onMouseUpOrLeave);
        this.root.removeEventListener("mousemove", this.onMouseMove);

        this.stopDragging();
    }
    
    onMouseMove = (e: MouseEvent) => {
        // here we catching situation when the mouse is outside the browser document 
        if (e.clientX > document.documentElement.scrollWidth) {
            this.stopDragging();
        } else {
            this.resetPosition(e.clientX);
        }
    }
    
    resetPosition(newPosition: number) {
        const diff = newPosition - this.lastPosition;
        this.splitter.style.left = (this.getElementStylePropAsNumber(this.splitter, 'left') + diff).toString() + 'px';
        this.lastPosition = newPosition;
    }

    stopDragging() {
        this.setState({
            ...this.state,
            isDragging: false,
            leftPanelWidth: this.getElementStylePropAsNumber(this.splitter, 'left')
        });

        this.splitter.style.left = null;
    }

    render() {
        const { children, minPanelPercentageWidth } = this.props,
            { leftPanelWidth, isDragging } = this.state;

        let rightWidth = (this.root ?
            (this.root.offsetWidth - leftPanelWidth) -  SPLITTER_WIDTH / 2
            : 50);
        let leftWidth = leftPanelWidth -  SPLITTER_WIDTH / 2;
/*
        if (percentageRightWidth < minPanelPercentageWidth) {
            percentageRightWidth = minPanelPercentageWidth - splitterPercentageWidth;
            percentageLeftWidth = 100 - minPanelPercentageWidth - splitterPercentageWidth;
        } else if (percentageLeftWidth < minPanelPercentageWidth) {
            percentageLeftWidth = minPanelPercentageWidth - splitterPercentageWidth;
            percentageRightWidth = 100 - minPanelPercentageWidth - splitterPercentageWidth;
        }
*/
        const leftClassName = createSelector("splitter-pane-left", isDragging ? "dragging" : null),
              rightClassName = createSelector("splitter-pane-right", isDragging ? "dragging" : null),
              splitterClassName = createSelector("splitter-bar", isDragging ? "dragging" : null),
              rootClassName = createSelector("splitter", isDragging ? "dragging" : null);

        return (
            <div className={rootClassName} ref={ref => this.root = ref}
                style={{gridTemplateColumns: `${leftWidth}px ${SPLITTER_WIDTH}px ${rightWidth}px`}}>
                <div className={leftClassName} 
                    ref={ref => this.leftPanel = ref}>
                    {children[0]}
                </div>
                <div className={rightClassName} ref={pane => this.rightPanel = pane}>
                    {children[1]}
                </div>
                <div className={splitterClassName} onMouseDown={(e) => this.splitterMouseDown(e)}
                    ref={ref => this.splitter = ref}>
                    <div className="splitter-bar-icon"/>
                </div>
            </div>
        )
    }

    getElementStylePropAsNumber(element: HTMLElement, stylePropName: string): number {
        if (!element.style[stylePropName]) {
            return 0;
        }

        const strProp : string = element.style[stylePropName].toString();
        // removing px
        return Number(strProp.substring(0, strProp.length - 2));
    }
} 
