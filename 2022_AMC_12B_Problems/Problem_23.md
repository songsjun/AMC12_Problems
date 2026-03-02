# 2022 AMC 12B Problem 23

> This problem is the same as [2022 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems#Problem_25) and [2022 AMC 12B #23](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems#Problem_23).
## Problem
Let $x_0,x_1,x_2,\dotsc$ be a sequence of numbers, where each $x_k$ is either $0$ or $1$. For each positive integer $n$, define


$$S_n = \sum_{k=0}^{n-1} x_k 2^k$$


Suppose $7S_n \equiv 1 \pmod{2^n}$ for all $n \geq 1$. What is the value of the sum


$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}?$$


$\textbf{(A) } 6 \qquad \textbf{(B) } 7 \qquad \textbf{(C) }12\qquad \textbf{(D) } 14\qquad \textbf{(E) }15$
## Solution 1
In binary numbers, we have

$$S_n = (x_{n-1} x_{n-2} x_{n-3} x_{n-4} \ldots x_{2} x_{1} x_{0})_2.$$


It follows that

$$8S_n = (x_{n-1} x_{n-2} x_{n-3} x_{n-4} \ldots x_{2} x_{1} x_{0}000)_2.$$


We obtain $7S_n$ by subtracting the equations:


$$\begin{array}{clccrccccccr}

$$
& (x_{n-1} & x_{n-2} & x_{n-3} & x_{n-4} & \ldots & x_2 & x_1 & x_0 & 0 & 0 & 0 \ )_2 \\
-\quad & & & & (x_{n-1} & \ldots & x_5 & x_4 & x_3 & x_2 & x_1 & x_0)_2 \\
\hline
$$

  & & & & & & & & & & &  \\ [-2.5ex]
$$& ( \ \ ?& ? & ? & 0 \ \ \ & \ldots & 0 & 0 & 0 & 0 & 0 & 1 \ )_2 \\$$
$\end{array}$$$


We work from right to left:


$$\begin{alignat*}{6}

$$
x_0=x_1=x_2=1
\quad &\implies \quad &x_3 &= 0& \\
\quad &\implies \quad &x_4 &= 1& \\
\quad &\implies \quad &x_5 &= 1& \\
\quad &\implies \quad &x_6 &= 0& \\
\quad &\implies \quad &x_7 &= 1& \\
\quad &\implies \quad &x_8 &= 1& \\
\quad &\quad \vdots & & &
$$

$\end{alignat*}$$$


For all $n\geq3,$ we conclude that

- $x_n=0$ if and only if $n\equiv 0\pmod{3}.$

- $x_n=1$ if and only if $n\not\equiv 0\pmod{3}.$

Finally, we get $(x_{2019},x_{2020},x_{2021},x_{2022})=(0,1,1,0),$ from which

$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022} = \boxed{\textbf{(A) } 6}.$$


*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*

*~MRENTHUSIASM*
## Solution 2
First, notice that

$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022} = \frac{S_{2023} - S_{2019}}{2^{2019}}.$$


Then since $S_n$ is the modular inverse of $7$ in $\mathbb{Z}_{2^n}$, we can perform the Euclidean Algorithm to find it for $n = 2019,2023$.

Starting with $2019$,


$$\begin{align*}

$$
7S_{2019} &\equiv 1 \pmod{2^{2019}} \\
7S_{2019} &= 2^{2019}k + 1.
$$

$\end{align*}$$$


Now, take both sides $\operatorname{mod} \ 7$:


$$0 \equiv 2^{2019}k + 1 \pmod{7}.$$


Using Fermat's Little Theorem,

$$2^{2019} = (2^{336})^6 \cdot 2^3 \equiv 2^3 \equiv 1 \pmod{7}.$$


Thus,

$$0 \equiv k + 1 \pmod{7} \implies k \equiv 6 \pmod{7} \implies k = 7j + 6.$$


Therefore,

$$7S_{2019} = 2^{2019} (7j + 6) + 1 \implies S_{2019} = \frac{2^{2019} (7j + 6) + 1}{7}.$$


We may repeat this same calculation with $S_{2023}$ to yield

$$S_{2023} = \frac{2^{2023} (7h + 3) + 1}{7}.$$


Now, we notice that $S_n$ is basically an integer expressed in binary form with $n$ bits.
This gives rise to a simple inequality,

$$0 \leqslant S_n \leqslant 2^n.$$


Since the maximum possible number that can be generated with $n$ bits is

$$\underbrace{{11111\dotsc1}_2}_{n} = \sum_{k=0}^{n-1} 2^k = 2^n - 1 \leqslant 2^n.$$


Looking at our calculations for $S_{2019}$ and $S_{2023}$, we see that the only valid integers that satisfy that constraint are $j = h = 0$.


$$\frac{S_{2023} - S_{2019}}{2^{2019}} = \frac{\tfrac{2^{2023} \cdot 3 + 1}{7} - \tfrac{2^{2019} \cdot 6 + 1}{7}}{2^{2019}} = \frac{2^4 \cdot 3 - 6}{7} = \boxed{\textbf{(A) } 6}.$$


*~zoomanTV*
## Solution 3
As in Solution 2, we note that


$$x_{2019}+2x_{2020}+4x_{2021}+8x_{2022}=\frac{S_{2023}-S_{2019}}{2^{2019}}.$$


We also know that $7S_{2023} \equiv 1 \pmod{2^{2023}}$ and $7S_{2019} \equiv 1 \pmod{2^{2019}}$, this implies:


$$\textbf{(1) } 7S_{2023}=2^{2023}\cdot{x} + 1,$$


$$\textbf{(2) } 7S_{2019}=2^{2019}\cdot{y} + 1.$$


Dividing by $7$, we can isolate the previous sums:


$$\textbf{(3) } S_{2023}=\frac{2^{2023}\cdot{x} + 1}{7},$$


$$\textbf{(4) } S_{2019}=\frac{2^{2019}\cdot{y} + 1}{7}.$$


The maximum value of $S_n$ occurs when every $x_i$ is equal to $1$. Even when this happens, the value of $S_n$ is less than $2^n$. Therefore, we can construct the following inequalities:


$$\textbf{(3) } S_{2023}=\frac{2^{2023}\cdot{x} + 1}{7} < 2^{2023},$$


$$\textbf{(4) } S_{2019}=\frac{2^{2019}\cdot{y} + 1}{7} < 2^{2019}.$$


From these two equations, we can deduce that both $x$ and $y$ are less than $7$.

Reducing $\textbf{1}$ and $\textbf{2}\pmod{7},$ we see that


$$2^{2023}\cdot{x}\equiv 6\pmod{7},$$


and


$$2^{2019}\cdot{y}\equiv 6\pmod{7}.$$


The powers of $2$ repeat every $3, \pmod{7}.$

Therefore, $2^{2023}\equiv 2 \pmod 7$ and $2^{2019} \equiv 1 \pmod {7}.$ Substituing this back into the above equations,


$$2x\equiv{6}\pmod{7}$$


and


$$y\equiv{6}\pmod{7}.$$


Since $x$ and $y$ are integers less than $7$, the only values of $x$ and $y$ are $3$ and $6$ respectively.

The requested sum is


$$\begin{align*}

$$
\frac{S_{2023}-S_{2019}}{2^{2019}} &= \frac{\frac{2^{2023}\cdot{x} + 1}{7} - \frac{2^{2019}\cdot{y} + 1}{7}}{2^{2019}} \\
&= \frac{1}{2^{2019}}\left(\frac{2^{2023}\cdot{3} + 1}{7} -\left(\frac{2^{2019}\cdot{6} + 1}{7}  \right)\right) \\
&= \frac{3\cdot{2^4}-6}{7} \\
&= \boxed{\textbf{(A) } 6}.
$$

$\end{align*}$$$


*~Benedict T (countmath1)*
## Solution 4
Note that, as in Solution 2, we have

$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022} = \frac{S_{2023} - S_{2019}}{2^{2019}}.$$

 This is because

$$S_{2023} = x_{0}2^{0} + x_{1}2^{1} + \cdots + x_{2019}2^{2019} + \cdots + x_{2022}2^{2022}$$

 and

$$S_{2019} = x_{0}2^{0} + x_{1}2^{1} + \cdots + x_{2018}2^{2018}.$$

 Note that

$$S_{2023} - S_{2019} = x_{2019}2^{2019} + \cdots + x_{2022}2^{2022} = 2^{2019}(x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}).$$

 Therefore,

$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022} = \frac{S_{2023} - S_{2019}}{2^{2019}}.$$

 Multiplying both sides by 7 gives us

$$7(x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}) = \frac{7S_{2023} - 7S_{2019}}{2^{2019}}.$$

 We can write

$$7S_{2023} = 1\pmod{2^{2023}} = 1 + 2^{2023}a = 1 + 2^{2019}*16a$$

 and

$$7S_{2019} = 1\pmod{2^{2019}} = 1 + 2^{2019}b$$

 for some a and b. Substituting, we get

$$7(x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}) = \frac{(1 + 2^{2019} * 16a) - (1 + 2^{2019}b)}{2^{2019}} = 16a - b.$$

 Therefore, our answer can be written as

$$\frac{16a - b}{7}.$$

 Another thing to notice is that a and b are integers between 0 and 6. This is because

$$7(1 + 2 + 4 + 8 + \cdots + 2^{2022}) \geqslant 7S_{2023} = 1 + 2^{2023}a$$

 which is

$$7(2^{2023}) - 7 \geqslant 1 + 2^{2023}a$$



$$(7-a) \geqslant \frac{8}{2^{2023}}$$

 which only holds when a is less than 7 because the right is very small positive number, so the left must be positive, too. Clearly, a is also non-negative, because otherwise,

$$7S_{2023} = 1 + 2^{2023}a < 0$$

 which would mean

$$S_{2023} < 0$$

 which cannot happen, so a is greater than 0.  A similar explanation for b shows that b is an integer between 0 and 6 inclusive.

Going back to the solution, if our answer to the problem is n, then

$$16a - b = 7n$$

 and

$$16a = 7n + b,$$

 so we can try the five option choices and see which one, when multiplied by 7 and added to some whole number between 0 and 6 results in a multiple of 16. Trying all the option choices, we see that you need to add $7n$ to something more than 6 to equal a multiple of 16 other than for option A. Therefore, the answer is $\boxed{\textbf{(A) } 6}.$

*~Rutvik Arora (youtube channel: https://www.youtube.com/channel/UCkgAgmNAQV8WGTOazGYEGwg)*
*~whatdohumanitarianseat made a small edit for a typo*
## Solution 5
Given that $7S_n \equiv 1 \pmod{2^n}$, we have


$$\begin{align*}
$7S_n$ &= $a_n2^n + 1$\\
$$7S_{n-1} &= a_{n-1}2^{n-1} + 1.$$
$\end{align*}$$$


where $a_n$ is integer.

Notice that

$$S_n = S_{n-1} + 2^{n-1}x_{n-1}.$$


Thus,


$$\begin{align*}

$$
7(S_n - S_{n-1}) &= 2^{n-1}(2a_n - a_{n-1})\\
7 \cdot 2^{n - 1}x_{n - 1} &= 2^{n - 1}(2a_n - a_{n - 1})\\
7x_{n-1} &= 2a_n - a_{n-1}.
$$

$\end{align*}$$$


Obviously, $x_0 = 1, S_1 = 1, 7S_1 = 3 \times 2^1 + 1$, so $a_1 = 3$.
For each $i$, $x_i$ must be 0 or 1, and $a_i$ is an integer, so we can repeat the recursion to yield


$$\begin{align*}
$x_$1 = $\frac{2a_2 - a_1}{7} = \frac{2a_2 - 3}{7}\text{ can only be 1, where }$a_2 = 5\\
$x_$2 = $\frac{2a_3 - a_2}{7} = \frac{2a_3 - 5}{7}\text{ can only be 1, where }$a_3 = 6\\
$x_$3 = $\frac{2a_4 - a_3}{7} = \frac{2a_4 - 6}{7}\text{ can only be 0, where }$a_4 = 3\\
$x_$4 = $\frac{2a_5 - a_4}{7} = \frac{2a_5 - 3}{7}\text{ can only be 1, where }$a_5 = 5\\
$x_$5 = $\frac{2a_6 - a_5}{7} = \frac{2a_6 - 5}{7}\text{ can only be 1, where }$a_6 = 6\\
$x_$6 = $\frac{2a_7 - a_6}{7} = \frac{2a_7 - 6}{7}\text{ can only be 0, where }$a_7 = 3
$\end{align*}$$$


So for any non-negative integer $k$,  we can find that $x_{3k + 1} = 1, x_{3k + 2} = 1, x_{3k + 3} = 0$,

$$x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022} = 0 + 2 \times 1 + 4 \times 1 + 8 \times  0 = \boxed{\textbf{(A) } 6}.$$


~[https://artofproblemsolving.com/wiki/index.php/User:Reda_mandymath reda_mandymath]
## Solution 6
Using the given conditions, it is evident that $x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}=\frac{S_{2023}-S_{2019}}{2^{2019}}=a$ (for simplicity). Moreover, because $7S_n \equiv 1 \pmod{2^n}$ is true, an impulse to multiply the numerator and denominator by 7 is created. Let $7S_{2023}=2^{2023}k+1$ and $7S_{2019}=2^{2019}k'+1$.

$$
\begin{align*}
a=\frac{7S_{2023}-7S_{2019}}{7\cdot2^{2019}}&=\frac{2^{2023}k+1-2^{2019}k'-1}{7\cdot2^{2019}} \\
&=\frac{2^4k-k'}{7} \\
&=\frac{16k-k'}{7} \\
\end{align*}
$$

Furthermore, because $\le x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}\le15, \le\frac{16k-k'}{7}\le15$. The order pairs $(k,k',a)$ could be found through trial and error that satisfies conditions $7S_{2023}=2^{2023}k+1$ and $7S_{2019}=2^{2019}k'+1$. It is evident that $k\ne0,1,2$ using Euler's Theorem.

$(3,6,6)$ is valid because $7|2^{2023}\cdot3+1$ and $7|2^{2019}\cdot6$.
Thereby, $x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}=\boxed{\textbf{(A) } 6}$.

*~MaPhyCom*
## Solution 7 (Very Fast but Still Rigorous)
$7=2^3-1 | 2^{2022}-1$ since $3|2022$, so $2^{2022} \equiv 1 \pmod 7$, with


$$2^{2022}-1 = 7 (2^{2019} + 2^ {2016} + \dots +1).$$


$6 \cdot 2^{2022} +1$ thus is a multiple of $7$, so it is thus $7 \cdot S_n$. We have


$$6 \cdot 2^{2022} +1 = (2^2+2^1) (7 (2^{2019} + 2^ {2016} + \dots +1) +1) +1 = 7 ((2^2+2^1)(2^{2019} + 2^ {2016} + \dots +1) +1) = 7 (2^{2021}+ 2^{2020} + 2^{2018}+2^{2017}+\dots),$$


$$so $x_{2022}=0,x_{2021}=1, x_{2020}=1, x_{2019}=0 \implies x_{2019} + 2x_{2020} + 4x_{2021} + 8x_{2022}=\boxed{\textbf{(A) } 6}$.$$


~[Ddk001](https://artofproblemsolving.com/wiki/index.php/Ddk001)
## Video Solution by MOP 2024
https://youtu.be/ShEE5WMhS2w

*~r00tsOfUnity*
## Video Solution by ThePuzzlr
https://youtu.be/sBmk7tNSQBA

*~ThePuzzlr*
## Video Solution by Steven Chen
https://youtu.be/2Dw75Zy6yAQ

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by OmegaLearn Using Binary and Modular Arithmetic
https://youtu.be/s_Bgj9srrXI

*~pi_is_3.14*
## Video Solution by The Power of Logic
https://youtu.be/rZaJSTbs7jY
## Video Solution by Interstigation
https://youtu.be/r9VjnOzN4Ek

*~Interstigation*
## Video Solution by  grogg007 (No Binary)
https://youtu.be/EiJzaiw_YoQ?si=NvL9a8AslaH9m-IF
## See Also
