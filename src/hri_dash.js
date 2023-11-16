import React, { useState } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import { copyToClipboard, replaceHtmlTags } from './utils/utilities';
import { Button, Container, SpaceBetween, Header, Tabs, Badge, Popover, StatusIndicator, SegmentedControl,
  Modal, Link, Box, Table, TextFilter, Pagination, CollectionPreferences, PropertyFilter } from "@cloudscape-design/components";
import { useCollection } from '@cloudscape-design/collection-hooks';
import { fullColumnDefinitions, getMatchesCountText, paginationLabels, collectionPreferencesProps } from './utils/full-table-config';
import { toolboxGetMatchesCountText, toolboxPaginationLabels, toolboxCollectionPreferencesProps,
  toolboxFilteringProperties, propertyFilterI18nStrings, TableEmptyState, TableNoMatchState } from './utils/toolbox-table-config';
import '@cloudscape-design/global-styles/index.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import './example-styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class RisksDetails extends React.Component {
  constructor () {
    super();
    this.state = {
      showModal: false
    };
    
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }
  
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }
  
  render () {
    const bp_url = 'https://docs.aws.amazon.com/wellarchitected/latest/framework/' + this.props.data.WABestPracticeId + '.html'
    return (
      <div>
        <Button variant="inline-link" onClick={this.handleOpenModal}>More details</Button>
        <Modal
            size={'max'}
            expandToFit={true}
            header={this.props.data.TrustedAdvisorCheckName}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Popover
                    dismissButton={false}
                    position="top"
                    size="small"
                    triggerType="custom"
                    content={
                      <StatusIndicator type="success">
                        Raw json copied
                      </StatusIndicator>
                    }
                  >
                    <Button iconName="copy" variant="normal" onClick={() => copyToClipboard(JSON.stringify(this.props.data, undefined, 4))}>Copy</Button>
                  </Popover>
                </SpaceBetween>
              </Box>
            }
            visible={this.state.showModal}
            onDismiss={this.handleCloseModal}
        >
                <Table 
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      cell: (item) => item.TrustedAdvisorCheckName || "-"
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (item) => <span>{replaceHtmlTags(item.TrustedAdvisorCheckDesc)}</span> || "-"
                    },
                    {
                      id: "bestPractice",
                      header: "Best Practice",
                      cell: (item) => (
                        <Link external href={bp_url}>{item.WABestPracticeTitle || "-"}</Link>
                      )
                    },
                    {
                      id: "pillar",
                      header: "Pillar",
                      cell: (item) => item.WAPillarId || "-"
                    },
                    {
                      id: "businessRisk",
                      header: "Business Risk",
                      cell: (item) => item.WABestPracticeRisk || "-"
                    },
                    {
                      id: "resource",
                      header: "Resource at Risk",
                      cell: (item) => JSON.stringify(item.FlaggedResources, null, 4) || "-"
                    },
                  ]}
                  items={[this.props.data]}
                  loadingText="Loading data"
                  sortingDisabled
                  wrapLines
                  empty={
                    <Box
                      margin={{ vertical: "xs" }}
                      textAlign="center"
                      color="inherit"
                    >
                      <SpaceBetween size="m">
                        <b>No data</b>
                      </SpaceBetween>
                    </Box>
                  }
                />
        </Modal>
      </div>
    );
  }
}

export function CollectionHooksTable({ data }) {
  const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['name', 'description', 'bestPractice', 'pillar', 'businessRisk', 'resourceId'] });
  const { items, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    (data) ? data : [],
    {
      filtering: {
        empty: <Box
                  margin={{ vertical: "xs" }}
                  textAlign="center"
                  color="inherit"
                >
                  <SpaceBetween size="m">
                    <b>No data</b>
                  </SpaceBetween>
                </Box>,
        noMatch: "No matches",
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
    }
  );
  return (
    <Table
      {...collectionProps}
      columnDefinitions={fullColumnDefinitions}
      visibleColumns={preferences.visibleContent}
      wrapLines
      stickyHeader
      items={items}
      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={getMatchesCountText(filteredItemsCount)}
          filteringAriaLabel="Filter data"
        />
      }
      preferences={
        <CollectionPreferences
          {...collectionPreferencesProps}
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
        />
      }
    />
  );
}

function toolboxCreateLabelFunction(columnName) {
  return ({ sorted, descending }) => {
    const sortState = sorted ? `sorted ${descending ? 'descending' : 'ascending'}` : 'not sorted';
    return `${columnName}, ${sortState}.`;
  };
}

export function CollectionHooksTableToolbox({ toolboxItems, onTakeItem, risksData, uploadFile, segmentsControl, activeSegment }) {
  const [selectedItems, setSelectedItems] = useState([]);

  const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['name', 'pillar', 'businessRisk', 'taCheckStatus', 'resourceId'] });
  const { items, actions, filteredItemsCount, collectionProps, propertyFilterProps, paginationProps } = useCollection(
    (toolboxItems) ? toolboxItems : [],
    {
      propertyFiltering: {
        filteringProperties: toolboxFilteringProperties,
        empty: <TableEmptyState resourceName="data" />,
        noMatch: (
          <TableNoMatchState
            onClearFilter={() => {
              actions.setPropertyFiltering({ tokens: [], operation: 'and' });
            }}
          />
        ),
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
      selection: { keepSelection: true },
    }
  );

  const toolboxFullColumnDefinitions = [
    {
      id: "name",
      header: "Name",
      cell: (item) => <Button variant="normal" onClick={onTakeItem.bind(undefined, item)}>
                [{parseInt(item.i) + 1}] {item.TrustedAdvisorCheckName}
        </Button> || "-",
      ariaLabel: toolboxCreateLabelFunction('Name'),
      sortingField: 'name'
    },
    {
      id: "description",
      header: "Description",
      cell: (item) => <span>{replaceHtmlTags(item.TrustedAdvisorCheckDesc)}</span> || "-",
      ariaLabel: toolboxCreateLabelFunction('Description'),
      sortingField: 'description'
    },
    {
      id: "bestPractice",
      header: "Best Practice",
      cell: (item) => (
        <Link external href={'https://docs.aws.amazon.com/wellarchitected/latest/framework/' + item.WABestPracticeId + '.html'}>{item.WABestPracticeTitle || "-"}</Link>
      ),
      ariaLabel: toolboxCreateLabelFunction('Best Practice'),
      sortingField: 'bestPractice'
    },
    {
      id: "pillar",
      header: "Pillar",
      cell: (item) => item.WAPillarId || "-",
      ariaLabel: toolboxCreateLabelFunction('Pillar'),
      sortingField: 'pillar'
    },
    {
      id: "businessRisk",
      header: "Business Risk",
      cell: (item) => 
        item.WABestPracticeRisk === 'High' ? <StatusIndicator type="error">{item.WABestPracticeRisk}</StatusIndicator>
          : item.WABestPracticeRisk === 'Medium' ? <StatusIndicator type="warning">{item.WABestPracticeRisk}</StatusIndicator>
          : item.WABestPracticeRisk === 'Low' ? <StatusIndicator type="info">{item.WABestPracticeRisk}</StatusIndicator>
          : "-",
      ariaLabel: toolboxCreateLabelFunction('Business Risk'),
      sortingField: 'businessRisk'
    },
    {
      id: "taCheckStatus",
      header: "Check Status",
      cell: (item) => 
        item.resultStatus === 'error' ? <StatusIndicator type="error">{item.resultStatus}</StatusIndicator>
          : item.resultStatus === 'warning' ? <StatusIndicator type="warning">{item.resultStatus}</StatusIndicator>
          : item.resultStatus === 'ok' ? <StatusIndicator type="success">{item.resultStatus}</StatusIndicator>
          : "-",
      ariaLabel: toolboxCreateLabelFunction('Check Status'),
      sortingField: 'taCheckStatus'
    },
    {
        id: "resourceId",
        header: "Resource at Risk",
        cell: (item) => item.resourceId || "-",
        ariaLabel: toolboxCreateLabelFunction('Resource at Risk'),
        sortingField: 'resourceId'
    },
    {
      id: "resourceRaw",
      header: "Resource at Risk (Raw)",
      cell: (item) => JSON.stringify(item.FlaggedResources, null, 4) || "-",
      ariaLabel: toolboxCreateLabelFunction('Resource at Risk (Raw)'),
      sortingField: 'resourceRaw'
    },
    {
      id: "region",
      header: "Region",
      cell: (item) => item.region || "-",
      ariaLabel: toolboxCreateLabelFunction('Region'),
      sortingField: 'region'
    },
    {
      id: "uniqueId",
      header: "UniqueId",
      cell: (item) => item.uniqueId || "-",
      ariaLabel: toolboxCreateLabelFunction('UniqueId'),
      sortingField: 'uniqueId'
    },
  ];

  return (
    <Table
      {...collectionProps}
      columnDefinitions={toolboxFullColumnDefinitions}
      visibleColumns={preferences.visibleContent}
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={evt => setSelectedItems(evt.detail.selectedItems)}
      wrapLines
      resizableColumns
      stickyHeader
      variant="container"
      items={items}
      trackBy="uniqueId"
      contentDensity="comfortable"
      pagination={<Pagination {...paginationProps} ariaLabels={toolboxPaginationLabels} />}
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          i18nStrings={propertyFilterI18nStrings}
          countText={toolboxGetMatchesCountText(filteredItemsCount)}
          expandToViewport={true}
        />
      }
      preferences={
        <CollectionPreferences
          {...toolboxCollectionPreferencesProps}
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
        />
      }
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween
              direction="horizontal"
              size="xs"
            >
              <Button 
                disabled={selectedItems.length === 0}
                onClick={() => {
                    for (let i = 0; i < selectedItems.length; i++) {
                      onTakeItem.bind(undefined, selectedItems[i])()
                    }
                    setSelectedItems([]);
                }}
              >
                Add all selected {selectedItems.length && filteredItemsCount
                  ? "(" + selectedItems.length + "/" + filteredItemsCount + ")"
                  : selectedItems.length ? "(" + selectedItems.length + "/" + toolboxItems.length + ")"
                  : filteredItemsCount ? "(" + filteredItemsCount + ")"
                  : "(" + toolboxItems.length + ")"}
              </Button>
              <RisksFullTable data={risksData}/>
              <Button variant="primary" iconName={"upload"}>
                <input className="inputButton hidden" type={"file"} accept={".json"} onChange={uploadFile} />
                Upload json file
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween
                  direction="horizontal"
                  size="xxl"
                >
                  <div>Trusted Advisor Checks </div>
                  {<SegmentedControl
                    selectedId={activeSegment}
                    onChange={(e) => {
                      segmentsControl.bind(undefined, e)();
                    }}
                    label="Default segmented control"
                    options={[
                      { text: "Table view", id: "table" },
                      { text: "Container view", id: "container" }
                    ]}
                  />}
            </SpaceBetween>
        </Header>
      }
    />
  );
}

class RisksFullTable extends React.Component {
  constructor () {
    super();
    this.state = {
      showModal: false
    };
    
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }
  
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }
  
  render () {
    return (
      <div>
        <Button 
          variant="normal" 
          onClick={this.handleOpenModal}
          disabled={this.props.data === null}
        >
            Risks Table
        </Button>
        <Modal
            size={'max'}
            expandToFit={true}
            header='Risks'
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Popover
                      dismissButton={false}
                      position="top"
                      size="small"
                      triggerType="custom"
                      renderWithPortal
                      content={
                        <StatusIndicator type="success">
                          Raw json copied
                        </StatusIndicator>
                      }
                  >
                    <Button iconName="copy" variant="normal" onClick={() => copyToClipboard(JSON.stringify(this.props.data, undefined, 4))}>Copy</Button>
                  </Popover>
                </SpaceBetween>
              </Box>
            }
            visible={this.state.showModal}
            onDismiss={this.handleCloseModal}
        >
          <CollectionHooksTable data={this.props.data} />
        </Modal>
      </div>
    );
  }
}

class ToolBoxItem extends React.Component {
  render() {
    if (this.props.urgency === 'high') {
      return (
        <Button iconName="status-warning" variant="normal" onClick={this.props.onTakeItem.bind(undefined, this.props.item)}>
          [{parseInt(this.props.item.i) + 1}] {this.props.risksData[this.props.item.i].TrustedAdvisorCheckName} ({this.props.risksData[this.props.item.i].resourceId})
        </Button>
      );
    }
    if (this.props.urgency === 'medium') {
      return (
        <Button iconName="status-stopped" variant="normal" onClick={this.props.onTakeItem.bind(undefined, this.props.item)}>
          [{parseInt(this.props.item.i) + 1}] {this.props.risksData[this.props.item.i].TrustedAdvisorCheckName} ({this.props.risksData[this.props.item.i].resourceId})
        </Button>
      );
    }
    if (this.props.urgency === 'low') {
      return (
        <Button iconName="status-pending" variant="normal" onClick={this.props.onTakeItem.bind(undefined, this.props.item)}>
          [{parseInt(this.props.item.i) + 1}] {this.props.risksData[this.props.item.i].TrustedAdvisorCheckName} ({this.props.risksData[this.props.item.i].resourceId})
        </Button>
      );
    }
  }
}

export default class ToolboxLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    initialLayout: generateLayout()
  };

  state = {
    currentBreakpoint: "lg",
    compactType: null,
    mounted: false,
    layouts: { lg: this.props.initialLayout },
    toolbox: { lg: [] },
    risksData: null,
    activeTab: 'highUrgency',
    toolboxTableView: true,
    activeSegment: 'table'
  };

  componentDidMount() {
    this.setState({ mounted: true });
    risksInit(this);
  }

  buttonsList = [
    { onClick: ()=> alert('clicked icon1') },
    { onClick: ()=> alert('clicked icon2') },
  ]

  generateDOM() {
    return _.map(this.state.layouts[this.state.currentBreakpoint], l => {
      return (
        <div key={l.i}>
          <Container
            disableContentPaddings
            disableHeaderPaddings
            header={
              <Header
                variant="h3"
              >
                {this.state.risksData[l.i].FlaggedResources.status === 'error' ? <Box variant="h3" color="text-status-error"><Button iconName="close" variant="icon" onClick={this.onPutItem.bind(this, l)}/>[{parseInt(l.i) + 1}]{this.state.risksData[l.i].TrustedAdvisorCheckName}</Box>
                  : this.state.risksData[l.i].FlaggedResources.status === 'warning' ? <Box variant="h3" color="text-status-warning"><Button iconName="close" variant="icon" onClick={this.onPutItem.bind(this, l)}/>[{parseInt(l.i) + 1}]{this.state.risksData[l.i].TrustedAdvisorCheckName}</Box>
                  : this.state.risksData[l.i].FlaggedResources.status === 'ok' ? <Box variant="h3" color="text-status-success"><Button iconName="close" variant="icon" onClick={this.onPutItem.bind(this, l)}/>[{parseInt(l.i) + 1}]{this.state.risksData[l.i].TrustedAdvisorCheckName}</Box>
                  : "-"}
              </Header>
            }
          >
            <SpaceBetween
              alignItems="center"
              direction="vertical"
              size="xs"
            >
              <Box variant="p">
                {this.state.risksData[l.i].resourceId}
              </Box>
              <RisksDetails data={this.state.risksData[l.i]}/>
            </SpaceBetween>
          </Container>
        </div>
      );
    });
  }

  onBreakpointChange = breakpoint => {
    this.setState(prevState => ({
      currentBreakpoint: breakpoint,
      toolbox: {
        ...prevState.toolbox,
        [breakpoint]:
          prevState.toolbox[breakpoint] ||
          prevState.toolbox[prevState.currentBreakpoint] ||
          []
      }
    }));
  };

  onTakeItem = item => {
    this.setState(prevState => ({
      toolbox: {
        ...prevState.toolbox,
        [prevState.currentBreakpoint]: prevState.toolbox[
          prevState.currentBreakpoint
        ].filter(({ i }) => i !== item.i)
      },
      layouts: {
        ...prevState.layouts,
        [prevState.currentBreakpoint]: [
          ...prevState.layouts[prevState.currentBreakpoint],
          item
        ]
      }
    }));
  };

  onPutItem = item => {
    this.setState(prevState => {
      return {
        toolbox: {
          ...prevState.toolbox,
          [prevState.currentBreakpoint]: [
            ...(prevState.toolbox[prevState.currentBreakpoint] || []),
            item
          ]
        },
        layouts: {
          ...prevState.layouts,
          [prevState.currentBreakpoint]: prevState.layouts[
            prevState.currentBreakpoint
          ].filter(({ i }) => i !== item.i)
        }
      };
    });
  };

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
    this.setState({ layouts });
  };

  resetLayout = () => {
    this.setState({
      layouts: { lg: [] },
      toolbox: { lg: [] },
      risksData: null
    });
  }

  expandFlaggedResources = (risksData) => {
    let expandedRisksData = [];
    for (let i = 0; i < risksData.length; i++) {
      for (let n = 0; n < risksData[i].FlaggedResources.length; n++) {
        let tmpRisksObject = JSON.parse(JSON.stringify(risksData[i]));
        tmpRisksObject.FlaggedResources = risksData[i].FlaggedResources[n];
        tmpRisksObject.resourceId = (risksData[i].FlaggedResources[n].metadata) ? risksData[i].FlaggedResources[n].metadata.join(", ") : '';
        tmpRisksObject.uniqueId = risksData[i].TrustedAdvisorCheckId + "_" + risksData[i].FlaggedResources[n].resourceId
        expandedRisksData.push(tmpRisksObject);
      }
    }
    return expandedRisksData
  }

  uploadFile = (event) => {
    let file = event.target.files[0];
    this.resetLayout();
    
    if (file) {
      let fileReader = new FileReader(); 
      fileReader.readAsText(file); 
      fileReader.onload = () => {
        let expandedRisksData = this.expandFlaggedResources(JSON.parse(fileReader.result));
        let layout = generateLayout(true, expandedRisksData);
        this.setState({
          layouts: { lg: layout },
          risksData: expandedRisksData
        });
        risksInit(this);
      }; 
      fileReader.onerror = () => {
        console.log(fileReader.error);
      }; 
    }
  }

  renderToolBoxItems = (items, urgency) => {
    return (items.map(item => (
      <ToolBoxItem
        key={item.i}
        item={item}
        onTakeItem={this.onTakeItem}
        risksData={this.state.risksData}
        urgency={urgency}
      />
    )))
  }

  getHighUrgencyItems = (items) => {
    let highUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.risksData[items[i].i].FlaggedResources.status === 'error') {
        highUrgencyItems.push(items[i]);
      }
    }
    return highUrgencyItems
  }

  getMediumUrgencyItems = (items) => {
    let mediumUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.risksData[items[i].i].FlaggedResources.status === 'warning') {
        mediumUrgencyItems.push(items[i]);
      }
    }
    return mediumUrgencyItems
  }

  getLowUrgencyItems = (items) => {
    let lowUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.risksData[items[i].i].FlaggedResources.status === 'ok') {
        lowUrgencyItems.push(items[i]);
      }
    }
    return lowUrgencyItems
  }

  segmentsControl = (event) => {
    const newSegment = event.detail.selectedId;
    this.setState({ activeSegment: newSegment });
    this.setState({ toolboxTableView: event.detail.selectedId === 'table' ? true : false });
  }

  render() {
    let highUrgencyItems = this.getHighUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    let mediumUrgencyItems = this.getMediumUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    let lowUrgencyItems = this.getLowUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    return (
      <div>
        { !this.state.toolboxTableView ? <Container
          fitHeight={true}
          disableContentPaddings
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween
                  direction="horizontal"
                  size="xs"
                >
                  <RisksFullTable data={this.state.risksData}/>
                  <Button variant="primary" iconName={"upload"}>
                    <input className="inputButton hidden" type={"file"} accept={".json"} onChange={this.uploadFile} />
                    Upload json file
                  </Button>
                </SpaceBetween>
              }
            >
              <SpaceBetween
                  direction="horizontal"
                  size="xxl"
                >
                  <div>Trusted Advisor Checks </div>
                  {<SegmentedControl
                    selectedId={this.state.activeSegment}
                    onChange={(e) => {
                      this.segmentsControl(e)
                    }}
                    label="Default segmented control"
                    options={[
                      { text: "Table view", id: "table" },
                      { text: "Container view", id: "container" }
                    ]}
                  />}
              </SpaceBetween>
            </Header>
          }
        >
          <Tabs
            tabs={[
              {
                  label: <div>High Urgency <Badge color="red">{highUrgencyItems.length}</Badge></div>,
                  id: 'highUrgency',
                  content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(highUrgencyItems, 'high')}</SpaceBetween></div>
              },
              {
                label: <div>Medium Urgency <Badge color="grey">{mediumUrgencyItems.length}</Badge></div>,
                id: 'mediumUrgency',
                content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(mediumUrgencyItems, 'medium')}</SpaceBetween></div>
              },
              {
                label: <div>Low Urgency <Badge color="green">{lowUrgencyItems.length}</Badge></div>,
                id: 'lowUrgency',
                content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(lowUrgencyItems, 'low')}</SpaceBetween></div>
              }
            ]}
            activeTabId={this.state.activeTab}
            onChange={(e) => {
              const newTab = e.detail.activeTabId;
              this.setState({ activeTab: newTab });
            }}
          />
        </Container> : <Container
            fitHeight={false}
            disableContentPaddings
          >
            <div className="toolbox-tableview"><CollectionHooksTableToolbox toolboxItems={this.state.toolbox[this.state.currentBreakpoint] || []} onTakeItem={this.onTakeItem} risksData={this.state.risksData} uploadFile={this.uploadFile} segmentsControl={this.segmentsControl} activeSegment={this.state.activeSegment}/></div>
        </Container>
        }

        <div className="yAxisTop">High Impact</div>
        <div className="yAxisBottom">Low Impact</div>
        <div className="xAxisLeft">High Urgency</div>
        <div className="xAxisRight">Low Urgency</div>
        <div className="verticalLine"></div>
        <hr width="100%" color="gray" className="horizontalLine"></hr>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
          allowOverlap={true}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

function risksInit(currentState) {
    currentState.setState(prevState => {
        return {
          toolbox: {
            ...prevState.layouts,
            [prevState.currentBreakpoint]: [
              ...(prevState.layouts[prevState.currentBreakpoint] || [])
            ]
          },
          layouts: {
            ...prevState.toolbox,
            [prevState.currentBreakpoint]: prevState.toolbox[
              prevState.currentBreakpoint
            ]
          }
        };
      });
    return
}

function generateLayout(uploaded=false,risksData=null) {
    if (uploaded === false) {
        return [];
    } else {
      let risksLength = risksData.length;
      return _.map(_.range(0, risksLength), function(item, i) {
          return {
          x: 5,
          y: 9,
          w: 2,
          h: 3,
          i: i.toString(),
          static: false,
          TrustedAdvisorCheckId: risksData[i].TrustedAdvisorCheckId,
          TrustedAdvisorCheckName: risksData[i].TrustedAdvisorCheckName,
          TrustedAdvisorCheckDesc: risksData[i].TrustedAdvisorCheckDesc,
          WAPillarId: risksData[i].WAPillarId,
          WAQuestionId: risksData[i].WAQuestionId,
          WABestPracticeId: risksData[i].WABestPracticeId,
          WABestPracticeTitle: risksData[i].WABestPracticeTitle,
          WABestPracticeDesc: risksData[i].WABestPracticeDesc,
          WABestPracticeRisk: risksData[i].WABestPracticeRisk,
          resourceId: risksData[i].resourceId,
          resultStatus: risksData[i].FlaggedResources.status,
          region: risksData[i].FlaggedResources.region,
          uniqueId: risksData[i].uniqueId
          };
      });
    }
}