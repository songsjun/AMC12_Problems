# 2022 AMC 12B Problem 22

> This problem is the same as [2022 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_23) and [2022 AMC 12B #22](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_22).
## Problem
Ant Amelia starts on the number line at $0$ and crawls in the following manner. For $n=1,2,3,$ Amelia chooses a time duration $t_n$ and an increment $x_n$ independently and uniformly at random from the interval $(0,1).$ During the $n$th step of the process, Amelia moves $x_n$ units in the positive direction, using up $t_n$ minutes. If the total elapsed time has exceeded $1$ minute during the $n$th step, she stops at the end of that step; otherwise, she continues with the next step, taking at most $3$ steps in all. What is the probability that Amelia’s position when she stops will be greater than $1$?

$\textbf{(A) }\frac{1}{3} \qquad \textbf{(B) }\frac{1}{2} \qquad \textbf{(C) }\frac{2}{3} \qquad \textbf{(D) }\frac{3}{4} \qquad \textbf{(E) }\frac{5}{6}$
## Solution 1 (Geometric Probability)
Let $x$ and $y$ be random variables that are independently and uniformly distributed in the interval $(0,1).$ Note that

$$P(x+y\leq 1)=\frac{\frac12\cdot1^2}{1^2}=\frac12,$$

 as shown below:
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
real xMin = -0.25;
real xMax $= 1$.25;
real yMin = -0.25;
real yMax $= 1$.25;
```


//Draws the horizontal ticks
void horizontalTicks()
{
  for (real $i = 1$; i < yMax; ++i)
  {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-1/32,i)--(1/32,i), black+linewidth(1));
```

  }
}

//Draws the vertical ticks
void verticalTicks()
{
  for (real $i = 1$; i < xMax; ++i)
  {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((i,-1/32)--(i,1/32), black+linewidth(1));
```

  }
}

horizontalTicks();
verticalTicks();

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$0$",(0,0),2*SW);
label("$1$",(1,0),2*S);
label("$1$",(0,1),2*W);
fill((0,0)--(1,0)--(0,1)--cycle,yellow);
draw((0,1)--(1,1)^^(1,0)--(1,1),dashed);
draw((0,1)--(1,0));
draw((xMin,0)--(xMax,0),black+linewidth(1.5),EndArrow(8));
draw((0,yMin)--(0,yMax),black+linewidth(1.5),EndArrow(8));
label("$x$",(xMax,0),(2,0));
label("$y$",(0,yMax),(0,2));
```

</asy>
Let $x,y,$ and $z$ be random variables that are independently and uniformly distributed in the interval $(0,1).$ Note that

$$P(x+y+z\leq 1)=\frac{\frac13\cdot\left(\frac12\cdot1^2\right)\cdot1}{1^3}=\frac16,$$

 as shown below:
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
```

import graph3;
import solids;


> [Asymptote diagram - not rendered in Markdown]

```asy
currentprojection=orthographic((0.3,0.1,0.1));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(surface((1,0,0)--(0,1,0)--(0,0,1)--cycle),yellow);
draw(surface((1,0,0)--(0,1,0)--(0,0,0)--cycle),yellow);
draw(surface((1,0,0)--(0,0,1)--(0,0,0)--cycle),yellow);
draw(surface((0,1,0)--(0,0,1)--(0,0,0)--cycle),yellow);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0,1)--(0,1,1)--(1,1,1)--(1,0,1)--cycle,dashed);
draw((0,1,0)--(1,1,0)--(1,0,0),dashed);
draw((0,1,1)--(0,1,0)^^(1,1,1)--(1,1,0)^^(1,0,1)--(1,0,0),dashed);
draw((-0.5,0,0)--(1.5,0,0),linewidth(1.25),EndArrow3(10));
draw((0,-0.5,0)--(0,1.5,0),linewidth(1.25),EndArrow3(10));
draw((0,0,-0.5)--(0,0,1.5),linewidth(1.25),EndArrow3(10));
draw((-0.1,0,1)--(0.1,0,1),linewidth(1));
draw((0,1,-0.1)--(0,1,0.1),linewidth(1));
draw((1,-0.1,0)--(1,0.1,0),linewidth(1));
label("$x$",(1.5,0,0),4*dir((1.5,0,0)));
label("$y$",(0,1.5,0),2*dir((0,1.5,0)));
label("$z$",(0,0,1.5),2*dir((0,0,1.5)));
label("$0$",(0,0,0),2*dir((0,0.5,-0.5)));
label("$1$",(1,0,0),4*dir((0,-1,0)));
label("$1$",(0,1,0),4*dir((0,0,-1)));
label("$1$",(0,0,1),5*dir((-1,0,0)));
draw((1,0,0)--(0,1,0)--(0,0,1)--cycle);
```

</asy>
We have two cases:
<ol style="margin-left: 1.5em;">
  <li>Amelia takes exactly $2$ steps.</li><p>
We need $x_1+x_2>1$ and $t_1+t_2>1.$ So, the probability is

$$P(x_1+x_2>1)\cdot P(t_1+t_2>1)=\left(1-\frac12\right)\cdot\left(1-\frac12\right)=\frac14.$$


  <li>Amelia takes exactly $3$ steps.</li><p>
We need $x_1+x_2+x_3>1$ and $t_1+t_\leq1.$ So, the probability is

$$P(x_1+x_2+x_3>1)\cdot P(t_1+t_2\leq1)=\left(1-\frac16\right)\cdot\frac12=\frac{5}{12}.$$


</ol>
Together, the answer is $\frac14 + \frac{5}{12} = \boxed{\textbf{(C) }\frac{2}{3}}.$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*

*~MRENTHUSIASM*
## Solution 2 (Generalization and Induction)
We can in fact find the probability that any number of randomly distributed numbers on the interval $[0, 1]$ sum to more than $1$ using geometric probability, as shown in the video below.

If we graph the points that satisfy $x + y < 1$, $0 < x, y < 1$, we get the triangle with points $(0, 0)$, $(1, 0)$, and $(0, 1)$. If we graph the points that satisfy $x + y + z < 1$, $0 < x, y, z < 1$, we get the tetrahedron with points $(0, 0, 0)$, $(1, 0, 0)$, $(0, 1, 0)$, and $(0, 0, 1)$.

Of course, the probability of either of these cases happening is simply the area/volume of the points we graphed divided by the total area of the graph, which is always $1$ (this would be much simpler than my calculus proof above).

Thus, we can now solve for the probability that the sum is less than one for $n$ numbers using induction.

$\textbf{Claim:}$ The probability that the sum is less than one is $\frac{1}{n!}$.

$\textbf{Base Case:}$ For just $1$ number, the probability is $1$.

$\textbf{Induction step:}$ Suppose that the probability for $n$ numbers is $\frac{1}{n!}$. We will prove that the probability for $n+1$ numbers is $\frac{1}{(n+1)!}$. To prove this, we consider that the area of an $n+1$-dimensional tetrahedron is simply the area/volume of the base times the height divided by $n+1$.

Of course, the area of the base is $\frac{1}{n!}$, and the height is $1$, and thus, we obtain $\frac{1}{n! \cdot (n+1)} = \frac{1}{(n+1)!}$ as our volume (this may be hard to visualize for higher dimensions). The induction step is complete.

The probability of the sum being less than $1$ is $\frac{1}{n!}$, and the probability of the sum being more than $1$ is $\frac{n!-1}{n!}$. This trivializes the problem. The answer is

$$\frac{1}{2} \cdot \frac{2! - 1}{2!} + \frac{1}{2} \cdot \frac{3! - 1}{3!} = \boxed{\textbf{(C) }\frac{2}{3}}.$$


*~mathboy100*
## Solution 3 (Observations)
There are two cases: Amelia takes two steps or three steps.

The former case has a probability of $\frac{1}{2}$, as stated in Solution 1, and thus the latter also has a probability of $\frac{1}{2}$.

The probability that Amelia passes $1$ after two steps is also $\frac{1}{2}$, as it is symmetric to the probability above.

Thus, if the probability that Amelia passes $1$ after three steps is $x$, our total probability is $\frac{1}{2} \cdot \frac{1}{2} + \frac{1}{2} \cdot x$. We know that $0 < x < 1$, and it is relatively obvious that $x > \frac{1}{2}$ (because the probability that $x > \frac{3}{2}$ is $\frac{1}{2}$). This means that our total probability is between $\frac{1}{2}$ and $\frac{3}{4}$, non-inclusive, so the only answer choice that fits is $\boxed{\textbf{(C) }\frac{2}{3}}$.

*~mathboy100*
## Remark (Calculus)
It is not immediately clear why three random numbers between $0$ and $1$ have a probability of $\frac{5}{6}$ of summing to more than $1$. Here is a proof:

Let us start by finding the probability that two random numbers between $0$ and $1$ have a sum of more than $x$, where $0 \leq x \leq 1$.

Suppose that our two numbers are $y$ and $z$. Then, the probability that $y > x$ (which means that $y + z > x$) is $1 - x$, and the probability that $y < x$ is $x$.

If $y < x$, the probability that $y + z > x$ is $1 - x + y$. This is because the probability that $y + z < x$ is equal to the probability that $z < x - y$, which is $x - y$, so our total probability is $1 - (x - y) = 1 - x + y$.

Let us now find the average of the probability that $y + z > x$ when $y < x$. Since $y$ is a random number between $0$ and $x$, its average is $\frac{x}{2}$. Thus, our average is $1 - x + \frac{1}{2} = 1 - \frac{x}{2}$.

Hence, our total probability is equal to


$$1(1-x) + \left(1 - \frac{x}{2}\right)(x) = 1 - \frac{1}{2}x^2.$$


Now, let us find the probability that three numbers uniformly distributed between $0$ and $1$ sum to more than $1$.

Let our three numbers be $a$, $b$, and $c$. Then, the probability that $a + b + c > 1$ is equal to the probability that $b + c$ is greater than $1 - a$, which is equal to $1 - \frac{1}{2}(1 - a)^2$.

To find the total probability, we must average over all values of $a$. This average is simply equal to the area under the curve $1 - \frac{1}{2}(1-x)^2$ from $0$ to $1$, all divided by $1$. We can compute this value using integrals:


$$\begin{align*}

$$
\frac{\int_0^1 \! 1 - \frac{1}{2}(1 - x)^2 \mathrm{d}x}{1} &= \int_0^1 \! 1 - \frac{1}{2}(1 - x)^2 \mathrm{d}x \\
&= 1 - \frac{1}{2}\int_0^1 \! (1 - x)^2 \mathrm{d}x \\
&= 1 - \frac{1}{2}\int_0^1 \! x^2 \mathrm{d}x \\
&= 1 - \frac{1}{2}\left(\frac{1}{3}\right) \\
&= \frac{5}{6}.
$$

$\end{align*}$$$


For those who don't know calculus, $\int_m^n \! f(x) \mathrm{d}x$ is the area under the curve $f(x)$ from $m$ to $n$.

*~mathboy100*
## Remark (Rigorous Calculus)
In the language of probability, we have three random variables $X$, $Y$, $Z$, each independent and uniformly distributed over the interval $(0, 1)$. We are interested in the probability that $X+Y+Z>1$, or $P(X+Y+Z>1)$.

It follows from the definition of the joint probability density function $f(x, y, z)$ that (we assume that $0<x, y, z<1$):

$$
\begin{align}
P(X+Y+Z>1)=\iiint_{x+y+z>1} f(x,y,z) \,dx\,dy\,dz.
\end{align}
$$

Since $X, Y, Z$ are independent, we have $f(x, y, z)=f_X(x)*f_Y(y)*f_Z(z)$, where $f_X(x), f_Y(y), f_Z(z)$ represent the probability densities of $X, Y, Z$ respectively. Recall that $X, Y, Z$ are uniformly distributed over the interval $(0, 1)$. Hence, $f_X(x)=f_Y(y)=f_Z(z)=1$.

It remains to evaluate the following triple integral

$$
\begin{align}
\iiint_{x+y+z>1} \,dx\,dy\,dz=\frac{5}{6}.
\end{align}
$$

Therefore, $P(X+Y+Z>1)=\frac{5}{6}$.

*~tsun26*
## Video Solution by OmegaLearn Using Geometric Probability
https://youtu.be/-AqhcVX8mTw

*~pi_is_3.14*
## Video Solution
https://youtu.be/WsA94SmsF5o

*~ThePuzzlr*

https://youtu.be/qOxnx_c9kVo

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by The Power of Logic (#22 and #23)
https://youtu.be/rZaJSTbs7jY
## Video Solution by Interstigation
https://youtu.be/KRkNnlszdEg

*~Interstigation*
## See Also
