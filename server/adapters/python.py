from __future__ import annotations
from typing import *
from collections import *
import json, sys, contextlib, heapq, math, bisect
__config=/*CONFIG*/
class ListNode:
    def __init__(self,val=0,next=None): self.val,self.next=val,next
class TreeNode:
    def __init__(self,val=0,left=None,right=None): self.val,self.left,self.right=val,left,right
def __decode(value,kind):
    if kind.endswith('[]'): return [__decode(v,kind[:-2]) for v in value]
    if kind=='ListNode':
        head=None
        for v in reversed(value or []): head=ListNode(v,head)
        return head
    if kind=='TreeNode':
        if not value or value[0] is None: return None
        root=TreeNode(value[0]); q=deque([root]); i=1
        while q and i<len(value):
            node=q.popleft()
            for key in ('left','right'):
                if i<len(value) and value[i] is not None:
                    child=TreeNode(value[i]); setattr(node,key,child); q.append(child)
                i+=1
        return root
    return value
def __encode(value,kind):
    if kind.endswith('[]'): return [__encode(v,kind[:-2]) for v in value]
    if kind in ('ListNode','TreeNode'):
        out=[]; seen=set(); q=deque([value])
        while q:
            node=q.popleft()
            if node is None:
                if kind=='TreeNode': out.append(None)
                continue
            if id(node) in seen or len(seen)>100000: raise ValueError('Cyclic or oversized node output')
            seen.add(id(node)); out.append(node.val)
            q.extend([node.left,node.right] if kind=='TreeNode' else [node.next])
        while kind=='TreeNode' and out and out[-1] is None: out.pop()
        return out
    return value
/*USER_CODE*/
def __source_args(raw):
    if __config.get('adapterStyle')=='ancestor':
        root=__decode(raw[0],'TreeNode')
        def find(n,v): return n if not n or n.val==v else find(n.left,v) or find(n.right,v)
        return [root,find(root,raw[1]),find(root,raw[2])]
    args=[__decode(v,p['type']) for v,p in zip(raw,__config['params'])]
    if __config.get('adapterStyle')=='cycle':
        nodes=[]; n=args[0]
        while n: nodes.append(n); n=n.next
        if raw[1]>=0: nodes[-1].next=nodes[raw[1]]
        return args[:1]
    return args
for raw in json.loads(sys.stdin.read()):
    try:
        with contextlib.redirect_stdout(sys.stderr):
            if __config.get('systemdesign'):
                ops,params=raw
                if ops[0]!=__config['classname'] or len(ops)!=len(params): raise ValueError('Invalid design operation sequence')
                instance=/*CLASS*/(*[__decode(v,p['type']) for v,p in zip(params[0],__config['constructor']['params'])]); value=[None]
                for name,values in zip(ops[1:],params[1:]):
                    method=next(m for m in __config['methods'] if m['name']==name)
                    value.append(__encode(getattr(instance,name)(*[__decode(v,p['type']) for v,p in zip(values,method['params'])]),method['return']['type']))
            else:
                args=__source_args(raw)
                ret=getattr(Solution(),__config['name'])(*args)
                output=__config.get('output')
                value=__encode(args[output['paramindex']],__config['params'][output['paramindex']]['type']) if output else __encode(ret,__config['return']['type'])
                if output and output.get('size')=='ret':
                    if type(ret) is not int or ret<0 or ret>len(value): raise ValueError('Invalid returned prefix length')
                    value=value[:ret]
                if __config.get('adapterStyle')=='ancestor': value=ret.val if ret else None
        print(__config['marker']+json.dumps({'value':value},allow_nan=False))
    except Exception as error: print(__config['marker']+json.dumps({'error':str(error)}))
