# 2018 AMC 12A Problem 25

> This problem is the same as [2018 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_25) and [2018 AMC 12A #25](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_25).
## Problem
For a positive integer $n$ and nonzero digits $a$, $b$, and $c$, let $A_n$ be the $n$-digit integer each of whose digits is equal to $a$; let $B_n$ be the $n$-digit integer each of whose digits is equal to $b$, and let $C_n$ be the $2n$-digit (not $n$-digit) integer each of whose digits is equal to $c$. What is the greatest possible value of $a + b + c$ for which there are at least two values of $n$ such that $C_n - B_n = A_n^2$?

$\textbf{(A) } 12 \qquad \textbf{(B) } 14 \qquad \textbf{(C) } 16 \qquad \textbf{(D) } 18 \qquad \textbf{(E) } 20$
## Solution 1
By geometric series, we have


$$\begin{alignat*}{8}
$A_n$&=a$\bigl($\phantom{ }\underbrace{$111\cdots1$}_{n$\text{ digits}$}\phantom{ }$\bigr)$&&=a$\left(1+10+10^2+\cdots+10^{n-1}\right)$&&=a$\cdot\frac{10^n-1}{9},$ \\
$B_n$&=b$\bigl($\phantom{ }\underbrace{$111\cdots1$}_{n$\text{ digits}$}\phantom{ }$\bigr)$&&=b$\left(1+10+10^2+\cdots+10^{n-1}\right)$&&=b$\cdot\frac{10^n-1}{9},$ \\
$C_n$&=c$\bigl($\phantom{ }\underbrace{$111\cdots1$}_{2n$\text{ digits}$}\phantom{ }$\bigr)$&&=c$\left(1+10+10^2+\cdots+10^{2n-1}\right)$&&=c$\cdot\frac{10^{2n}-1}{9}.$
$\end{alignat*}$$$


By substitution, we rewrite the given equation $C_n - B_n = A_n^2$ as


$$c\cdot\frac{10^{2n}-1}{9} - b\cdot\frac{10^n-1}{9} = a^2\cdot\left(\frac{10^n-1}{9}\right)^2.$$


Since $n > 0,$ it follows that $10^n > 1.$ We divide both sides by $\frac{10^n-1}{9}$ and then rearrange:


$$\begin{align*}

$$
c\left(10^n+1\right) - b &= a^2\cdot\frac{10^n-1}{9} \\
9c\left(10^n+1\right) - 9b &= a^2\left(10^n-1\right) \\
\left(9c-a^2\right)10^n &= 9b-9c-a^2. &&(\bigstar)
$$

$\end{align*}$$$


Let $y=10^n.$ Note that $(\bigstar)$ is a linear equation with $y,$ and $y$ is a one-to-one function of $n.$ Since $(\bigstar)$ has at least two solutions of $n,$ it has at least two solutions of $y.$ We conclude that $(\bigstar)$ must be an identity, so we get the following system of equations:


$$\begin{align*}

$$
9c-a^2&=0, \\
9b-9c-a^2&=0.
$$

$\end{align*}$$$


The first equation implies that $c=\frac{a^2}{9}.$ Substituting this into the second equation gives $b=\frac{2a^2}{9}.$

To maximize $a + b + c = a + \frac{a^2}{3},$ we need to maximize $a.$ Clearly, $a$ must be divisible by $3.$ The possibilities for $(a,b,c)$ are $(9,18,9),(6,8,4),$ or $(3,2,1),$ but $(9,18,9)$ is invalid. Therefore, the greatest possible value of $a + b + c$ is $\boxed{\textbf{(D) } 18}.$

*~CantonMathGuy (Solution)*

*~MRENTHUSIASM (Revision)*
## Solution 2
Immediately start trying $n = 1$ and $n = 2$. These give the system of equations $11c - b = a^2$ and $1111c - 11b = (11a)^2$ (which simplifies to $101c - b = 11a^2$). These imply that $a^2 = 9c$, so the possible $(a, c)$ pairs are $(9, 9)$, (6, 4)$$, and $(3, 1)$. The first puts $b$ out of range but the second makes $b = 8$. We now know the answer is at least $6 + 8 + 4 = 18$.

We now only need to know whether $a + b + c = 20$ might work for any larger $n$. We will always get equations like $100001c - b = 11111a^2$ where the $c$ coefficient is very close to being nine times the $a$ coefficient. Since the $b$ term will be quite insignificant, we know that once again $a^2$ must equal $9c$, and thus $a = 9, c = 9$ is our only hope to reach $20$. Substituting and dividing through by $9$, we will have something like $100001 - \frac{b}{9} = 99999$. No matter what $n$ really was, $b$ is out of range (and certainly isn't $2$ as we would have needed).

The answer then is $\boxed{\textbf{(D) } 18}$.
## Solution 3
The given equation can be written as


$$c \cdot (\phantom{ } \overbrace{1111 \ldots 1111}^{2n\text{ digits}}\phantom{ }) - b \cdot (\phantom{ } \overbrace{11 \ldots 11}^{n\text{ digits}} \phantom{ }) = a^2 \cdot (\phantom{ } \overbrace{11 \ldots 11}^{n\text{ digits}} \phantom{ })^2.$$


Divide by $\overbrace{11 \ldots 11}^{n\text{ digits}}$ on both sides:


$$c \cdot (\phantom{ } \overbrace{1000 \ldots 0001}^{n+1\text{ digits}}\phantom{ }) - b = a^2 \cdot (\phantom{ } \overbrace{11 \ldots 11}^{n\text{ digits}} \phantom{ }).$$


Next, split the first term to make it easier to deal with:


$$\begin{align*}
$2c$ + c $\cdot ($\phantom{ }\overbrace{99 $\ldots 99}^{n$$\text{ digits}$}\phantom{ }) - b &= a^2 $\cdot ($\phantom{ } \overbrace{11 $\ldots 11}^{n$$\text{ digits}$} \phantom{ }) \\
$2c$ - b &$= (a^2 - 9c)\cdot ($\phantom{ }\overbrace{11 $\ldots 11}^{n$$\text{ digits}$}\phantom{ }).
$\end{align*}$$$


Because $2c - b$ and $a^2 - 9c$ are constants and because there must be at least two distinct values of $n$ that satisfy, $2c - b = a^2 - 9c = 0.$ Thus, we have


$$\begin{align*}
$2c$&=b, \\
$$a^2&=9c.$$
$\end{align*}$$$


Knowing that $a,b,$ and $c$ are single digit positive integers and that $9c$ must be a perfect square, the values of $(a,b,c)$ that satisfy both equations are $(3,2,1)$ and $(6,8,4).$ Finally, $6 + 8 + 4 = \boxed{\textbf{(D) } 18}.$

*~LegionOfAvatars (Solution)*

*~MRENTHUSIASM (Reformatting)*
## Solution 4 (Informed Guess)
By [PaperMath’s sum](https://artofproblemsolving.com/wiki/index.php/PaperMath’s_sum), the answer is at least $\boxed{\textbf{(D) } 18}.$
## Video Solution by Pi Academy (Easy)
https://youtu.be/DgtlLI9GaWY?si=WgXKpx2PCF1cftuE

*~Pi Academy*
## Video Solution (#21-#25)
https://youtube.com/playlist?list=PLpxy89D2tvVow8EoCSsNY3Y-2SwJly_SZ&si=aEJ3Ttjck10aCIUH
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2018amc10a/470

*~dolphin7*
## See Also
