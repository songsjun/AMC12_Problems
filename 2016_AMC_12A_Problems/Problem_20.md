# 2016 AMC 12A Problem 20

## Problem
A binary operation $\diamondsuit$ has the properties that $a\,\diamondsuit\, (b\,\diamondsuit \,c) = (a\,\diamondsuit \,b)\cdot c$ and that $a\,\diamondsuit \,a=1$ for all nonzero real numbers $a, b,$ and $c$. (Here $\cdot$ represents multiplication). The solution to the equation $2016 \,\diamondsuit\, (6\,\diamondsuit\, x)=100$ can be written as $\tfrac{p}{q}$, where $p$ and $q$ are relatively prime positive integers. What is $p+q?$

$\textbf{(A) }109\qquad\textbf{(B) }201\qquad\textbf{(C) }301\qquad\textbf{(D) }3049\qquad\textbf{(E) }33,601$
## Solution 1
We see that $a \, \diamondsuit \, a = 1$, and think of division. Testing, we see that the first condition $a \, \diamondsuit \, (b \, \diamondsuit \, c) = (a \, \diamondsuit \, b) \cdot c$ is satisfied, because $\frac{a}{\frac{b}{c}} = \frac{a}{b} \cdot c$. Therefore, division can be the operation $\diamondsuit$. Solving the equation,

$$\frac{2016}{\frac{6}{x}} = \frac{2016}{6} \cdot x = 336x = 100\implies x=\frac{100}{336} = \frac{25}{84},$$

 so the answer is $25 + 84 = \boxed{\textbf{(A) }109}$.
## Solution 2 (Proving that $\diamondsuit$ is division)
If the given conditions hold for all nonzero numbers $a, b,$ and $c$,

Let $a=b=c.$ From the first two givens, this implies that


$$a\diamondsuit\, (a\diamondsuit\, {a})=(a\diamondsuit\, a)\cdot{a}.$$


From $a\diamondsuit\,{a}=1,$ this equation simply becomes $a\diamondsuit\,{1}=a.$


Let $c=b.$ Substituting this into the first two conditions, we see that


$$a\diamondsuit\, (b\diamondsuit\, {c})=(a\diamondsuit\, {b})\cdot{c} \implies a\diamondsuit\, (b\diamondsuit\, {b})=(a\diamondsuit\, {b})\cdot{b}.$$


Substituting $b\diamondsuit\, {b} =1$, the second equation becomes


$$a\diamondsuit\, {1}=(a\diamondsuit\, {b})\cdot{b} \implies a=(a\diamondsuit\,{b})\cdot{b}.$$


Since $a, b$ and $c$ are nonzero, we can divide by $b$ which yields,


$$\frac{a}{b}=(a\diamondsuit\, {b}).$$


Now we can find the value of $x$ straightforwardly:


$$\frac{2016}{(\frac{6}{x})}=100 \implies 2016=\frac{600}{x} \implies x=\frac{600}{2016} = \frac{25}{84}.$$


Therefore, $a+b=25+84=\boxed{\textbf{A)} 109}$

*~Benedict T (countmath1)*

Note: We only really cared about what $a\diamondsuit\,{b}$ was, so we used the existence of $c$ to get an expression in terms of just $a$ and $b$.
## Solution 3
One way to eliminate the $\diamondsuit$ in this equation is to make $a = b$ so that  $a\,\diamondsuit\, (b\,\diamondsuit \,c) = c$. In this case, we can make $b = 2016$.


$$2016 \,\diamondsuit\, (6\,\diamondsuit\, x)=100\implies
$$(2016\, \diamondsuit\, 6) \cdot x = 100$$


By multiplying both sides by $\frac{6}{x}$, we get:


$$(2016\, \diamondsuit\, 6) \cdot 6 = \frac{600}{x}\implies
$$2016 \, \diamondsuit\, (6\, \diamondsuit\, 6) = \frac{600}{x}$$


Because $6\, \diamondsuit\, 6 = 2016\, \diamondsuit\, 2016 = 1:$


$$2016 \, \diamondsuit\, (2016\, \diamondsuit\, 2016) = \frac{600}{x}\implies

$$
(2016\, \diamondsuit\, 2016) \cdot 2016 = \frac{600}{x}\implies
2016 = \frac{600}{x}$$
$$


Therefore, $x = \frac{600}{2016} = \frac{25}{84}$, so the answer is $25 + 84 = \boxed{\textbf{(A) }109.}$
## Solution 4
We can manipulate the given identities to arrive at a conclusion about the binary operator $\diamondsuit$.  Substituting $b = c$ into the first identity yields

$$( a\ \diamondsuit\ b) \cdot b = a\ \diamondsuit\ (b\ \diamondsuit\  b) = a\ \diamondsuit\  1 = a\ \diamondsuit\ ( a\ \diamondsuit\ a) = ( a\ \diamondsuit\ a) \cdot a = a.$$

  Hence, $( a\ \diamondsuit\ b) \cdot b = a,$ or, dividing both sides of the equation by $b,$ ( a\ \diamondsuit\ b)$ = \frac{a}{b}.$

Hence, the given equation becomes $\frac{2016}{\frac{6}{x}} = 100$.  Solving yields $x=\frac{100}{336} = \frac{25}{84},$ so the answer is $25 + 84 = \boxed{\textbf{(A) }109.}$
## Solution 5
$2016 \diamondsuit (6 \diamondsuit x) = (2016 \diamondsuit 6) \cdot x = 100$

$2016 \diamondsuit (2016 \diamondsuit 1) = (2016 \diamondsuit 2016) \cdot 1 = 1 \cdot 1 = 1$

$2016 \diamondsuit 2016 = 1$, $2016 \diamondsuit (2016 \diamondsuit 1) = 1$, so $2016 \diamondsuit 1 = 2016$

$2016  \diamondsuit 1 = (2016  \diamondsuit 6) \cdot 6$, $2016 \diamondsuit 6 = \frac{2016  \diamondsuit 1}{6} = 336$

$x = \frac{100}{2016 \diamondsuit 6} = \frac{100}{336} = \frac{25}{84}$, $24 + 85 = \boxed{\textbf{(A) }109}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 6 (Fast)
First, looking at the conditions, we know that any nonzero real number $a$ satisfies:
$a \diamondsuit (a \diamondsuit a) = (a \diamondsuit a) \cdot a$
Using the next condition, we get that:
$a \diamondsuit 1 = a$

Notice that $2016 \diamondsuit 1 = 2016 \diamondsuit (6 \diamondsuit 6) = (2016 \diamondsuit 6) \cdot 6 =  2016$. Hence, $2016 \diamondsuit 6 = 336$. Thus, $2016 \diamondsuit (6 \diamondsuit x)=100 \implies (2016 \diamondsuit 6) \cdot x = 100 \implies 336x=100 \implies \frac{25}{84}$. Therefore, the answer is $\boxed{\textbf{(A) }109}$

*~Mathmagicops*

*~minor edits by CXP*
## Solution 7
We can rewrite $2016\diamondsuit (6\diamondsuit x)=100$ as $2016\diamondsuit \dfrac{100}x.$ We do a series of algebraic  manipulations:


$$(2016\diamondsuit 6)\cdot6=\dfrac{600}x$$


$$2016\diamondsuit (6\diamondsuit 6)=\dfrac{600}x$$


$$2016\diamondsuit 1=\dfrac{600}x.$$


Let $a=2016\diamondsuit 1.$


$$2016a=(2016\diamondsuit 1)\cdot 2016$$


$$2016a=2016\diamondsuit (1\diamondsuit 2016)$$


We let $b=1\diamondsuit 2016.$


$$2016b=(1\diamondsuit 2016)\cdot2016$$


$$2016b=1\diamondsuit (2016\diamondsuit 2016)$$


$$2016b=1\diamondsuit 1=1$$


$$b=\dfrac1{2016}$$


We notice that $1\diamondsuit \dfrac1{2016},$ which makes $a\diamondsuit b$ look suspiciously like $\dfrac ab.$ Sure enough, when we try the given condition on $a\diamondsuit \dfrac ab,$ we see that it works. We evaluate $2016\diamondsuit (6\diamondsuit x)=100,$ and get $x=\dfrac{25}{84},$ and therefore $p+q=25+84=109.$

*~Technodoggo*
## Video Solution 1
https://www.youtube.com/watch?v=8GULAMwu5oE
## Video Solution 2(Meta-Solving Technique)
https://youtu.be/GmUWIXXf_uk?t=1632

*~pi_is_3.14*
## See Also
