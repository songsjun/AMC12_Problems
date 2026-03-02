# 2024 AMC 12A Problem 1

> This problem is the same as [2024 AMC 10A #1](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10A_Problems/Problem_1) and [2024 AMC 12A #1](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12A_Problems/Problem_1).
## Problem
What is the value of $\cdot101-99\cdot10101?$

$\textbf{(A)}~2\qquad\textbf{(B)}~20\qquad\textbf{(C)}~200\qquad\textbf{(D)}~202\qquad\textbf{(E)}~2020$
## Solution 1 (Direct Computation)
The likely fastest method will be direct computation. $\cdot101$ evaluates to $1000001$ and $\cdot10101$ evaluates to $999999$. The difference is $\boxed{\textbf{(A) }2}.$

Solution by juwushu.
## Solution 2 (Distributive Property)
We have


$$\begin{align*}

$$
9901\cdot101-99\cdot10101 &= (10000-99)\cdot101-99\cdot(10000+101) \\
&= 10000\cdot101-99\cdot101-99\cdot10000-99\cdot101 \\
&= (10000\cdot101-99\cdot10000)-2\cdot(99\cdot101) \\
&= 2\cdot10000-2\cdot9999 \\
&= \boxed{\textbf{(A) }2}.
$$

$\end{align*}$$$


*~MRENTHUSIASM*
## Solution 3 (Solution 1 but Distributive)
Note that $\cdot101=9901\cdot100+9901=990100+9901=1000001$ and  $\cdot10101=100\cdot10101-10101=1010100-10101=999999$, therefore the answer is $\boxed{\textbf{(A) }2}$.

*~Tacos_are_yummy_1*
## Solution 4 (Modular Arithmetic)
Evaluating the given expression $\pmod{10}$ yields $\equiv 2 \pmod{10}$, so the answer is either $\textbf{(A)}$ or $\textbf{(D)}$. Evaluating $\pmod{101}$ yields $\equiv 2\pmod{101}$. Because answer $\textbf{(D)}$ is $\cdot 101$, that cannot be the answer, so we choose choice $\boxed{\textbf{(A) }2}$.
## Solution 5 (Process of Elimination)
We simply look at the units digit of the problem we have (or take mod $10$)


$$9901\cdot101-99\cdot10101 \equiv 1\cdot1 - 9\cdot1 = 2 \mod{10}.$$


Since the only answers with $2$ in the units digit are $\textbf{(A)}$ and $\textbf{(D)}$, we can then continue if you are desperate to use guess and check or an actually valid method to find the answer is $\boxed{\textbf{(A) }2}$.

*~mathkiddus*
## Solution 6 (Faster Distribution)
Observe that $\cdot100+1$ and $\cdot100+1$


$$\begin{align*}

$$
\Rightarrow9901\cdot101-99\cdot10101 & = ((9900\cdot101)+(1\cdot101))-((99\cdot10100)+(99\cdot1)) \\
&=(99\cdot100\cdot101)+101-(99\cdot100\cdot101)-99 \\
$$

&=101-99 \\
$$&=\boxed{\textbf{(A) }2}.$$
$\end{align*}$$$


*~laythe_enjoyer211*
## Solution 7 (Cubes)
Let $x=100$. Then, we have

$$
\begin{align*}
101\cdot 9901=(x+1)\cdot (x^2-x+1)=x^3+1, \\
99\cdot 10101=(x-1)\cdot (x^2+x+1)=x^3-1.
\end{align*}
$$

Then, the answer can be rewritten as $(x^3+1)-(x^3-1)= \boxed{\textbf{(A) }2}.$

*~erics118*
## Solution 8 (Super Fast)
It's not hard to observe and express $9901$ into $\cdot100+1$, and $10101$ into $\cdot100+1$.

We then simplify the original expression into $(\cdot100+1)\cdot101-99\cdot(101\cdot100+1)$, which could then be simplified into $\cdot100\cdot101+101-99\cdot100\cdot101-99$, which we can get the answer of $\boxed{\textbf{(A) }2}$.

*~RULE101*
## Solution 9 (Estimation) *🔥VERY FAST🔥*
Notice that the answer choices are significantly different in value. This allows us to estimate the answer. $9901$ is about $10000$, and $101$ is about $1$00. $99$ is about $100$, and $10101$ is about $10000$. Computing, we get $10000 \cdot 100-100 \cdot 10000 = 0$. The closest answer to this estimation is $\boxed{\textbf{(A) }2}$.
## Solution 10
We can see that the units digit of the expression is $1 - 9 \Rightarrow 11 - 9 \Rightarrow 2$, elimination options B, C, and E. Next, notice that $(9901)(101)$ is divisible by 101 while $(99)(10101)$ is not divisible by 101 (to see this, notice that 101 is prime, and $10101 = 10100 + 1$, so is not divisible by 101). This means that the final answer is not divisible by 101, eliminating $\textbf{(D)}$, so the answer is $\boxed{\textbf{(A) }2}$.
## Video Solution(Don't do the actual computation- be fast by taking mods!)
https://youtu.be/l3VrUsZkv8I

*~MC*
## Video Solution by Central Valley Math Circle
https://youtu.be/eLs748wDmMs

*~mr_mathman*
## Video Solution (⚡️ 1 min solve ⚡️)
https://youtu.be/RODYXdpipdc

<i>~Education, the Study of Everything </i>
## Video Solution by Pi Academy
https://youtu.be/GPoTfGAf8bc?si=JYDhLVzfHUbXa3DW
## Video Solution by FrankTutor
https://www.youtube.com/watch?v=ez095SvW5xI
## Video Solution Daily Dose of Math
https://youtu.be/Z76bafQsqTc

*~Thesmartgreekmathdude*
## Video Solution 1 by Power Solve
https://www.youtube.com/watch?v=j-37jvqzhrg
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=6SQ74nt3ynw
## Video Solution by Math from my desk
https://www.youtube.com/watch?v=n_G6wi1ulzY
## Video Solution by TheBeautyofMath
For AMC 10: https://youtu.be/uKXSZyrIOeU

For AMC 12: https://youtu.be/zaswZfIEibA

*~IceMatrix*
## Video Solution by Dr. David
https://youtu.be/aWu4BJMn9oc
## Video Solution by yjtest (2 Solutions, Good Approaches for Competitions)
https://www.youtube.com/watch?v=CSR-edmK52I
## Video solution by TheNeuralMathAcademy
https://www.youtube.com/watch?v=4b_YLnyegtw&t=0s
