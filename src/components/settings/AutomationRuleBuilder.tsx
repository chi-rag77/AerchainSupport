"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrgData } from '@/hooks/use-org-user';
import { useAutomationRules } from '@/features/automation/hooks/useAutomationRules';
import { AutomationRule, RuleCondition, RuleAction, RuleField, RuleOperator, RuleActionType } from '@/types';
import { Loader2, Zap, Trash2, Plus, Clock, AlertCircle, User, CheckCircle, Settings2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNowStrict } from 'date-fns';

// --- Constants for Rule Builder ---
const RULE_FIELDS: { value: RuleField; label: string; type: 'status' | 'priority' | 'assignee' | 'time' }[] = [
  { value: 'status', label: 'Ticket Status', type: 'status' },
  { value: 'priority', label: 'Ticket Priority', type: 'priority' },
  { value: 'assignee', label: 'Current Assignee', type: 'assignee' },
  { value: 'age_days', label: 'Ticket Age (Days)', type: 'time' },
  { value: 'time_since_update_hours', label: 'Time Since Update (Hours)', type: 'time' },
];

const OPERATORS: { [key in RuleField]: { value: RuleOperator; label: string }[] } = {
  status: [{ value: 'equals', label: 'is' }, { value: 'not_equals', label: 'is not' }],
  priority: [{ value: 'equals', label: 'is' }, { value: 'greater_than', label: 'is higher than' }],
  assignee: [{ value: 'equals', label: 'is' }, { value: 'not_equals', label: 'is not' }],
  age_days: [{ value: 'greater_than', label: 'is greater than' }, { value: 'less_than', label: 'is less than' }],
  time_since_update_hours: [{ value: 'greater_than', label: 'is greater than' }, { value: 'less_than', label: 'is less than' }],
  company: [{ value: 'equals', label: 'is' }, { value: 'not_equals', label: 'is not' }],
  type: [{ value: 'equals', label: 'is' }, { value: 'not_equals', label: 'is not' }],
};

const DEFAULT_CONDITION: RuleCondition = { field: 'status', operator: 'equals', value: '' };
const DEFAULT_ACTION: RuleAction = { type: 'update_status', target_value: '' };

const AutomationRuleBuilder = () => {
  const { orgUser, isOrgLoading } = useOrgData();
  const { rules, isLoading, createRule, updateRuleStatus, deleteRule, isCreating } = useAutomationRules();
  const isAdmin = orgUser?.role === 'admin';

  const [ruleName, setRuleName] = useState('');
  const [conditions, setConditions] = useState<RuleCondition[]>([DEFAULT_CONDITION]);
  const [actions, setActions] = useState<RuleAction[]>([DEFAULT_ACTION]);

  // --- Derived Data for Selects (Simplified for demo) ---
  const availableStatuses = useMemo(() => ['Open (Being Processed)', 'On Tech', 'Pending (Awaiting your Reply)', 'Escalated', 'Resolved', 'Closed'], []);
  const availablePriorities = useMemo(() => ['Low', 'Medium', 'High', 'Urgent'], []);
  const availableAssignees = useMemo(() => ['Unassigned', 'Admin User', 'Support Team'], []); // Placeholder

  const getFieldOptions = (field: RuleField) => {
    switch (field) {
      case 'status': return availableStatuses;
      case 'priority': return availablePriorities;
      case 'assignee': return availableAssignees;
      default: return [];
    }
  };

  // --- Handlers ---
  const handleConditionChange = (index: number, key: keyof RuleCondition, value: string | number) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    setConditions(newConditions);
  };

  const handleActionChange = (index: number, key: keyof RuleAction, value: string) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [key]: value };
    setActions(newActions);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || conditions.some(c => !c.value) || actions.some(a => !a.target_value)) {
      alert("Please fill out all fields for the rule, conditions, and actions.");
      return;
    }
    createRule({ name: ruleName, conditions, actions });
    setRuleName('');
    setConditions([DEFAULT_CONDITION]);
    setActions([DEFAULT_ACTION]);
  };

  const getActionDisplay = (action: RuleAction) => {
    switch (action.type) {
      case 'reassign': return `Reassign to: ${action.target_value}`;
      case 'update_priority': return `Set Priority to: ${action.target_value}`;
      case 'update_status': return `Set Status to: ${action.target_value}`;
      case 'send_notification': return `Notify: ${action.target_value}`;
      default: return 'Unknown Action';
    }
  };

  if (isOrgLoading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...</CardContent></Card>;
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            You must be an 'admin' to manage automation rules.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rule Creation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-green-500" /> Create New Automation Rule</CardTitle>
          <CardDescription>
            Define conditions (IF) that trigger automated actions (THEN) on tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRule} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                placeholder="e.g., Auto-Escalate Stalled Tickets"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                required
              />
            </div>

            {/* Trigger Conditions (IF) */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> IF (Trigger Conditions)</h4>
              {conditions.map((condition, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium">{index > 0 ? 'AND' : 'When'}</span>
                  
                  {/* Field Select */}
                  <Select
                    value={condition.field}
                    onValueChange={(value: RuleField) => handleConditionChange(index, 'field', value)}
                  >
                    <SelectTrigger className="w-[150px] bg-card">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  {/* Operator Select */}
                  <Select
                    value={condition.operator}
                    onValueChange={(value: RuleOperator) => handleConditionChange(index, 'operator', value)}
                  >
                    <SelectTrigger className="w-[120px] bg-card">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS[condition.field]?.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  {/* Value Input/Select */}
                  {['status', 'priority', 'assignee'].includes(condition.field) ? (
                    <Select
                      value={String(condition.value)}
                      onValueChange={(value) => handleConditionChange(index, 'value', value)}
                    >
                      <SelectTrigger className="w-[200px] bg-card">
                        <SelectValue placeholder="Select Value" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFieldOptions(condition.field).map(val => <SelectItem key={val} value={val}>{val}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      placeholder={condition.field.includes('days') ? "Days" : "Hours"}
                      value={String(condition.value)}
                      onChange={(e) => handleConditionChange(index, 'value', Number(e.target.value))}
                      className="w-[100px] bg-card"
                      min={0}
                      required
                    />
                  )}

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                    disabled={conditions.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setConditions([...conditions, DEFAULT_CONDITION])} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Condition
              </Button>
            </div>

            {/* Actions (THEN) */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4" /> THEN (Actions)</h4>
              {actions.map((action, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium">Perform Action:</span>
                  
                  {/* Action Type Select */}
                  <Select
                    value={action.type}
                    onValueChange={(value: RuleActionType) => handleActionChange(index, 'type', value)}
                  >
                    <SelectTrigger className="w-[150px] bg-card">
                      <SelectValue placeholder="Action Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reassign">Reassign Ticket</SelectItem>
                      <SelectItem value="update_priority">Update Priority</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                      <SelectItem value="send_notification">Send Notification</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Target Value Input/Select */}
                  {action.type === 'reassign' && (
                    <Select
                      value={action.target_value}
                      onValueChange={(value) => handleActionChange(index, 'target_value', value)}
                    >
                      <SelectTrigger className="w-[200px] bg-card">
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {action.type === 'update_priority' && (
                    <Select
                      value={action.target_value}
                      onValueChange={(value) => handleActionChange(index, 'target_value', value)}
                    >
                      <SelectTrigger className="w-[200px] bg-card">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {action.type === 'update_status' && (
                    <Select
                      value={action.target_value}
                      onValueChange={(value) => handleActionChange(index, 'target_value', value)}
                    >
                      <SelectTrigger className="w-[200px] bg-card">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {action.type === 'send_notification' && (
                    <Input
                      type="text"
                      placeholder="Notification Message"
                      value={action.target_value}
                      onChange={(e) => handleActionChange(index, 'target_value', e.target.value)}
                      className="w-[250px] bg-card"
                      required
                    />
                  )}

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setActions(actions.filter((_, i) => i !== index))}
                    disabled={actions.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setActions([...actions, DEFAULT_ACTION])} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Action
              </Button>
            </div>

            <Button type="submit" disabled={isCreating || !ruleName}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Save Rule
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-muted-foreground" /> Active Automation Rules ({rules.length})</CardTitle>
          <CardDescription>
            These rules are checked periodically against all active tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-24"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading rules...</div>
          ) : rules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No automation rules defined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Active</TableHead>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Trigger Conditions</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead className="text-right">Last Run</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => updateRuleStatus({ ruleId: rule.id, isActive: checked })}
                          disabled={isCreating}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.trigger_conditions.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {c.field} {c.operator} {c.value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.actions.map((a, i) => (
                            <Badge key={i} className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {getActionDisplay(a)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {rule.last_executed_at ? formatDistanceToNowStrict(new Date(rule.last_executed_at), { addSuffix: true }) : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Rule</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationRuleBuilder;