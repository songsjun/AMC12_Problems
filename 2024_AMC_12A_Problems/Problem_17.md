# 2024 AMC 12A Problem 17

> This problem is the same as [2024 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10A_Problems/Problem_23) and [2024 AMC 12A #17](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12A_Problems/Problem_17).
## Problem
Integers $a$, $b$, and $c$ satisfy $ab + c = 100, bc + a = 87$, and $ca + b = 60$. What is $ab + bc + ca$?

$\textbf{(A) }212 \qquad
$\textbf{(B) }247 \qquad$
$\textbf{(C) }258 \qquad$
$\textbf{(D) }276 \qquad$
$\textbf{(E) }284 \qquad$$
## Solution 1
Subtracting the first two equations yields $(a-c)(b-1)=13$. Notice that both factors are integers, so $b-1$ could equal one of $13,1,-1,-13$ and $b=14,2,0,-12$. We consider each case separately:

For $b=0$, from the second equation, we see that $a=87$. Then $87c=60$, which is not possible as $c$ is an integer, so this case is invalid.

For $b=2$, we have $2c+a=87$ and $ca=58$, which by experimentation on the factors of $58$ has no solution, so this is also invalid.

For $b=14$, we have $14c+a=87$ and $ca=46$, which by experimentation on the factors of $46$ has no solution, so this is also invalid.

Thus, we must have $b=-12$, so $a=12c+87$ and $ca=72$. Thus $c(12c+87)=72$, so $c(4c+29)=24$. We can simply trial and error this to find that $c=-8$ so then $a=-9$. The answer is then $(-9)(-12)+(-12)(-8)+(-8)(-9)=108+96+72=\boxed{\textbf{(D) }276}$.

By Antony Huang ~Very Minor Edit by lucassf12
## Solution 2
Adding up first two equations:

$$(a+c)(b+1)=187$$


$$b+1=\pm 11,\pm 17$$


$$b=-12,10,-18,16$$


Subtracting equation 1 from equation 2:

$$(a-c)(b-1)=13$$


$$b-1=\pm 1,\pm 13$$


$$b=0,2,-12,14$$


$$\Rightarrow b=-12$$


Which implies that $a+c=-17$ from $(a+c)(b+1)=187$

Giving us that $a+b+c=-29$

Therefore, $ab+bc+ac=100+87+60-(a+b+c)=\boxed{\text{(D) }276}$

*~lptoggled*
## Solution 3 (Guess and check)
The idea is that you could guess values for $c$, since then $a$ and $b$ are factors of $100 - c$. The important thing to realize is that $a$, $b$, and $c$ are all negative. Then, this can be solved in a few minutes, giving the solution $(-9, -12, -8)$, which gives the answer $\boxed{\textbf{(D)} 276}$
*~andliu766*
## Solution 4
$$\begin{align}
ab + c &= 100 \\
bc + a &= 87 \\
ca + b &= 60
$\end{align}$$$


$$(1) + (2) \implies  ab + c +bc + a = (a+c)(b+1)=187\implies b+1=\pm 11,\pm 17$$


$$(1) - (2) \implies ab + c - bc - a = (a-c)(b-1)=13\implies b-1=\pm 1,\pm 13$$


Note that $(b+1)-(b-1)=2$, and the only possible pair of results that yields this is $b-1=-13$ and $b+1=-11$, so $a+c=-17$.

Therefore,


$$ab+ba+ac=ab + c +bc + a + ca + b -(a+b+c) = (1)+(2)+(3) - (a+b+c) = 100+87+60-(a+b+c)=\boxed{\textbf{(D) }276}.$$


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso], yuvag, Technodoggo (LaTeX credits to the latter two and editing to the latter)
## Solution 5
$$\begin{align}
ab + c &= 100 \\
bc + a &= 87 \\
ca + b &= 60
$\end{align}$$$


$$
\begin{align*}
(1) - (2) \implies ab + c -bc - a &=(a-c)(b-1)=13 \\
(2) - (3) \implies bc + a -ca - b &=(b-a)(c-1)=27 \\
(3) - (1) \implies ca + b -ab - c &=(c-b)(a-1)=-40
\end{align*}
$$


There are $3$ ordered pairs of $(a,b,c)$: $(5,14,4)$, $(-3,-12,-3)$, $(-9,-12,-8)$.

However, only the last ordered pair meets all three equations.

Therefore, $ab+ba+ac= \cdot-12+-12\cdot-8+-8\cdot-9 = \boxed{\textbf{(D) }276}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso], megaboy6679 (formatting), Technodoggo (LaTeX optimization/clarity adjustments)
## Solution 6 (Elimination)
Before we start, keep in mind that the problem is asking for the sum $ab+bc+ac$. This is nothing but $100+87+60-a-b-c$, or $247-(a+b+c$).

To solve the problem, we systematically test the options using elimination:

Let's first check options A and B, since they only happen when a,b, and c sum to 35 or 0.
We begin by testing three positive values, but none satisfy the equation when there is a plus sign. For example, $(12, 8, 4)$ satisfies $ab + c = 100$, but does not satisfy $bc + a = 87$, or $ac + b = 60. If a+b+c=0$, then not all of the numbers can be positive or negative, so this would not work.
From this observation, we conclude that the answer cannot be $\textbf{A}$ or $\textbf{B}$.

Now let's test the next option, option C.
Option $\textbf{C}$ states $ab + bc + ca = 258$. If true, then:

$a + b + c = -11$

This sum is too large. Furthermore, if all three numbers are negative, the solution still fails. For example, testing $(-4, -5, -2)$ confirms the equation is not satisfied, as we get results that are too small. Thus, we eliminate option $\textbf{C}$.

Finally, let's test the last two options: D and E.
For option $\textbf{E}$, the sum $a + b + c$ would be:

$247 - 284 = -37$

Testing values such as $(-11, -12, -14)$, the resulting sums $ab + c$, $bc + a$, and $ac + b$ are far too large to satisfy the equation.
Therefore, $\textbf{E}$ is also eliminated.

Once we have this answer, we still need to verify it by testing out numbers:
Finally, we test option $\textbf{D}$. Using $ab + bc + ca = 276$, we get that $a+b+c = -29$. Also note that a, b, and c all have to be different, because the sums from the three equations are all different. We want to get the three closest values of a, b, and c such that they are all different, and the sum $a+b+c = -29$. The values $(-9, -12, -8)$ are the closest three numbers. When we try them, they satisfy all three equations.
So, the correct answer is:
$ab+ba+ac= -9\cdot-12+-12\cdot-8+-8\cdot-9 = \boxed{\textbf{(D) }276}.$

*~pimathmonkey*
## Video Solution by STEM Station(Quick and Easy to Understand!)
https://youtu.be/bfeqoUiWNhE
## Video Solution, Fast, Quick, Easy! Simple Factoring Technique
https://youtu.be/g4xdfcFgwGo
## Video Solution by SpreadTheMathLove
https://youtu.be/CVjqq_yRWvA?si=MgzdckiX0nCJP1jA
## Video Solution by TheBeautyofMath
https://youtu.be/1JyBt8Bh_vI
## Video solution by TheNeuralMathAcademy
https://www.youtube.com/watch?v=4b_YLnyegtw&t=5249s
