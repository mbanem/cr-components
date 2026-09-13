import Area from './Area.svelte'
import Baloon from './Baloon.svelte'
import Bindable from './Bindable.svelte'
import Box from './Box.svelte'
import Button from './Button.svelte'
import ButtonSpinner from './ButtonSpinner.svelte'
import Child from './Child.svelte'
import CircleSpinner from './CircleSpinner.svelte'
import Communicate from './Communicate.svelte'
import Comp from './Comp.svelte'
import CRActivity from './CRActivity.svelte'
import CRInput from './CRInput.svelte'
import CRSpinner from './CRSpinner.svelte'
import CRSummaryDetails from './CRSummaryDetails.svelte'
import CRTooltip from './CRTooltip.svelte'
import InputBox from './InputBox.svelte'
import Links from './Links.svelte'
import MultiSelect from './MultiSelect.svelte'
import MultiSelectBox from './MultiSelectBox.svelte'
import Nav from './Nav.svelte'
import NavBar from './NavBar.svelte'
import NavButton from './NavButton.svelte'
import NavContainer from './NavContainer.svelte'
import PageTitleCombo from './PageTitleCombo.svelte'
import PostList from './PostList.svelte'
import Prop from './Prop.svelte'
import RandomCanvas from './RandomCanvas.svelte'
import SummaryDetails from './SummaryDetails.svelte'
import TodoList from './TodoList.svelte'
import UserCRUDForm from './UserCRUDForm.svelte'

export { Area, Baloon, Bindable, Box, Button, ButtonSpinner, Child, CircleSpinner, Communicate, Comp, CRActivity, CRInput, CRSpinner, CRSummaryDetails, CRTooltip, InputBox, Links, MultiSelect, MultiSelectBox, Nav, NavBar, NavButton, NavContainer, PageTitleCombo, PostList, Prop, RandomCanvas, SummaryDetails, TodoList, UserCRUDForm }

/*
  from the above list wrapped in backticks to make a multi-line string
  create a comps list for creating the export statement above
  let compList = comps.replace(/import |from .+$|\n/gm,'').slice(0,-1).split(' ').join(',');
  console.log(compList)
*/