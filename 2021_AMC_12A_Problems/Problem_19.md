# 2021 AMC 12A Problem 19

## Problem
How many solutions does the equation $\sin \left( \frac{\pi}2 \cosx\right)=\cos \left( \frac{\pi}2 \sinx\right)$ have in the closed interval [0,$\pi$]?

$\textbf{(A) }0 \qquad \textbf{(B) }1 \qquad \textbf{(C) }2 \qquad \textbf{(D) }3\qquad \textbf{(E) }4$
## Solution 1 (Inverse Trigonometric Functions)
The ranges of $\frac{\pi}2 \sin$ x and $\frac{\pi}2 \cos$ x are both $\left$[$-\frac{\pi}2, \frac{\pi}2 \right$], which is included in the range of $\arcsin,$ so we can use it with no issues.

$$
\begin{align*} \frac{\pi}2 \cos x &= \arcsin \left( \cos \left( \frac{\pi}2 \sin x\right)\right) \\ \frac{\pi}2 \cos x &= \arcsin \left( \sin \left( \frac{\pi}2 - \frac{\pi}2 \sin x\right)\right) \\ \frac{\pi}2 \cos x &= \frac{\pi}2 - \frac{\pi}2 \sin x \\ \cos x &= 1 - \sin x \\ \cos x + \sin x &= 1. \end{align*}
$$

This only happens at $x = 0, \frac{\pi}2$ on the interval [0,$\pi$], because one of $\sin$ and $\cos$ must be 1 and the other 0. Therefore, the answer is $\boxed{\textbf{(C) }2}.$

*~Tucker*
## Solution 2 (Equality Conditions)
Hmmm, those values  $\frac{\pi}{2} \cos(x)$  and  $\frac{\pi}{2} \sin(x)$  look scary. If only there were a way to simplify it...

Well, thanks to trigonometry, we can! Notice the equality condition  $\sin\left(\frac{\pi}{2}\cos(x)\right) = \cos\left(\frac{\pi}{2}\sin(x)\right)$ . Now, say  $\frac{\pi}{2} \cos(x) = \mathcal{A}$  and  $\frac{\pi}{2} \sin(x) = \mathcal{B}$ . Then, we get  $\sin(\mathcal{A}) = \cos({\mathcal{B}})$ .

Aha! We know that  $\sin\left(\frac{\pi}{4}\right) = \cos\left(\frac{\pi}{4}\right)$ ! So, the solution set to  $\mathcal{A}$  or  $\mathcal{B}$  is  ($\mathcal{A},\mathcal{B}) = \frac{\pi}{4} + \pi$ k : k $\in \mathbb{Z}$ .

Now, we substitute the values of  $\mathcal{A}$  and  $\mathcal{B}$ , primarily,  $\frac{\pi}{2} \cos(x)$  and  $\frac{\pi}{2} \sin(x)$  respectively. We then have the two equalities:

$$\frac{\pi}{2}\cos(x) = \frac{\pi}{4} + \pi k : k \in \mathbb{Z}$$

$$\frac{\pi}{2}\sin(x) = \frac{\pi}{4} + \pi k : k \in \mathbb{Z}$$

In which multiplying by  $\frac{2}{\pi}$  on both sides rewards us with

$$\cos(x) = \frac{1}{2} + 2k : k \in \mathbb{Z}$$

$$\sin(x) = \frac{1}{2} + 2k : k \in \mathbb{Z}$$

Aha! The values between the interval [0,$\pi$] lie when  $k=0$  (because we originally had  $\pi$ k , so setting  $k = 1$  results in  $\pi$ , in which because we have the value $\frac{1}{2}$ at the right, we obtain $\frac{1}{2} + \pi,$ which is beyond the interval end bound $\pi,$ so the only values that lie within that interval are when  $k=0$ ). Simplification results in

$$\cos(x)=\frac{1}{2}$$

$$\sin(x)=\frac{1}{2}$$

The solutions to  $\sin(x)=\frac{1}{2}$  is  $x=\frac{\pi}{6} + \pi$ k  and  $x=\frac{5\pi}{6} + \pi$ k . We negate  $\frac{5\pi}{6} + \pi$ k  because that is not in the interval  [0, $\pi$]

Looking at  $\cos(x)=\frac{1}{2}$ , the solutions are  $\frac{\pi}{3} + \pi$ k  and  $\frac{5\pi}{3} + \pi$ k . Again, we negate  $\frac{5\pi}{3} + \pi$ k  as it is not in the interval  [0,$\pi$]

Now, we have one more thing to consider. The equality condition. Hmm, the two values of x seem to be different... Does this affect the equation to have no solutions?

No! Notice how we have  $\sin(\cos(x)) = \cos(\sin(y))$ ! Additionally, notice how  $\frac{\pi}{2} - \frac{\pi}{6} = \frac{\pi}{3}$ ! Now, assume  $x=\frac{\pi}{3}$  and  $y=\frac{\pi}{6}$ . We already know  $\sin(x)=\cos(90-x)$ ! So, we just have  $\cos(\cos(x))=\cos(\cos(\frac{\pi}{2}-y))$ , but  $\frac{\pi}{2}-y=x$ ! So, we achieve  $\cos(\cos(x)) = \cos(\cos(x))$ , which is always true!

Thus, any solution to this equation is in the form  $x=\frac{\pi}{6} + \pi$ k, $\frac{\pi}{3} + \pi$ k .

To obtain the degree measure over the interval  [0,$\pi$] , we must have  $k=0$ . So, we achieve the values  $x=\frac{\pi}{6}, \frac{\pi}{3}$ , or  $x=30^\circ, 60^\circ$

There are $\boxed{\textbf{(C) }2}$ values that satisfy the equation.

*~Pinotation*
## Solution 3 (Cofunction Identity)
By the Cofunction Identity $\cos\theta=\sin\left(\frac{\pi}{2}-\theta\right),$ we rewrite the given equation: $\sin \left(\frac{\pi}2 \cosx\right) = \sin \left(\frac{\pi}2 - \frac{\pi}2 \sinx\right).$
Recall that if $\sin\theta=\sin\phi,$ then $\theta=\phi+2n\pi$ or $\theta=\pi-\phi+2n\pi$ for some integer n. Therefore, we have two cases:

 1.   **$\boldsymbol{\frac{\pi}2 \cos x = \left(\frac{\pi}2 - \frac{\pi}2 \sin x\right) + 2n\pi}$ for some integer $\boldsymbol{n}$**
We rearrange and simplify: $\sin$ x + $\cosx = 1+4n$. By rough constraints, we know that -2 < $\sin$ x + $\cos$ x < 2, from which -$2 < 1-4n < 2$. The only possibility is $n=0$, so $\begin{align*} \sin$ x + $\cos$ x &= 1 && (*) \\ $\sin^2 x + \cos^2 x + 2\sin$ x $\cos$ x &= 1 \\ $2\sin$ x $\cos$ x &= 0 \\ $\sin(2x)$ &= 0 \\ 2x &= $k\pi$ \\ x &= $\frac{k\pi}{2} \end{align*}$ for some integer k.

We get $x=0,\frac{\pi}{2}$ for this case. Note that $x=\pi$ is an extraneous solution by squaring (*).

2.   **$\boldsymbol{\frac{\pi}2 \cos x = \pi - \left(\frac{\pi}2 - \frac{\pi}2 \sin x\right) + 2n\pi}$ for some integer $\boldsymbol{n}$**
Similar to Case 1, we conclude that $n=0$, so $\cos$ x - $\sinx = 1$. We get $x=0$ for this case.

Together, we obtain $\boxed{\textbf{(C) }2}$ solutions: $x=0,\frac{\pi}{2}.$

*~MRENTHUSIASM*
## Solution 4 (Graphs and Analyses)
This problem is equivalent to counting the intersections of the graphs of $y=\sin\left(\frac{\pi}{2}\cosx\right)$ and $y=\cos\left(\frac{\pi}{2}\sinx\right)$ in the closed interval [0,$\pi$]. We construct a table of values, as shown below:

$$
\begin{array}{c|ccc} & & & \\ [-2ex] & \boldsymbol{x=0} & \boldsymbol{x=\frac{\pi}{2}} & \boldsymbol{x=\pi} \\ [1.5ex] \hline & & & \\ [-1ex] \boldsymbol{\cos x} & 1 & 0 & -1 \\ [1.5ex] \boldsymbol{\frac{\pi}{2}\cos x} & \frac{\pi}{2} & 0 & -\frac{\pi}{2} \\ [1.5ex] \boldsymbol{\sin\left(\frac{\pi}{2}\cos x\right)} & 1 & 0 & -1 \\ [1.5ex] \hline & & & \\ [-1ex] \boldsymbol{\sin x} & 0 & 1 & 0 \\ [1.5ex] \boldsymbol{\frac{\pi}{2}\sin x} & 0 & \frac{\pi}{2} & 0 \\ [1.5ex] \boldsymbol{\cos\left(\frac{\pi}{2}\sin x\right)} & 1 & 0 & 1 \\ [1ex] \end{array}
$$

For $x\in$[0,$\pi$], note that:


$$* \frac{\pi}{2}\cos x\in\left[-\frac{\pi}{2},\frac{\pi}{2}\right], so \sin\left(\frac{\pi}{2}\cos x\right)\in[-1,1].$$


$$* \frac{\pi}{2}\sin x\in\left[0,\frac{\pi}{2}\right], so \cos\left(\frac{\pi}{2}\sin x\right)\in[0,1].$$


For the graphs to intersect, we need $\sin\left(\frac{\pi}{2}\cosx\right)\in$[0,1]. This occurs when $\frac{\pi}{2}\cosx\in\left$[0,$\frac{\pi}{2}\right$].

By the Cofunction Identity $\cos\theta=\sin\left(\frac{\pi}{2}-\theta\right),$ we rewrite the given equation:

$$\sin\left(\frac{\pi}{2}\cos x\right) = \sin\left(\frac{\pi}{2}-\frac{\pi}{2}\sin x\right).$$

Since $\frac{\pi}{2}\cosx\in\left$[0,$\frac{\pi}{2}\right$] and $\frac{\pi}{2}\sinx\in\left$[0,$\frac{\pi}{2}\right$], it follows that $x\in\left$[0,$\frac{\pi}{2}\right$] and $\frac{\pi}{2}-\frac{\pi}{2}\sinx\in\left$[0,$\frac{\pi}{2}\right$].

We can apply the arcsine function to both sides, then rearrange and simplify:

$$
\begin{align*} \frac{\pi}{2}\cos x &= \frac{\pi}{2}-\frac{\pi}{2}\sin x \\ \sin x + \cos x &= 1. \end{align*}
$$

From Case 1 in Solution 2, we conclude that (0,1) and $\left(\frac{\pi}{2},0\right)$ are the only points of intersection, as shown below:

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(600,200); real f(real x) { return sin(pi/2*cos(x)); } real g(real x) { return cos(pi/2*sin(x)); } draw(graph(f,0,pi),red,"$y=\sin\left(\frac{\pi}{2}\cos \right)$"); draw(graph(g,0,pi),blue,"$y=\cos\left(\frac{\pi}{2}\sin \right)$"); real xMin $= 0$; real xMax $= 5$/4*pi; real yMin = -2; real yMax $= 2$; //Draws the horizontal gridlines void horizontalLines() { for (real i = yMin+1; i < yMax; ++i) { draw((xMin,i)--(xMax,i), mediumgray+linewidth(0.4)); } } //Draws the vertical gridlines void verticalLines() { for (real i = xMin+pi/2; i < xMax; i+=pi/2) { draw((i,yMin)--(i,yMax), mediumgray+linewidth(0.4)); } } //Draws the horizontal ticks void horizontalTicks() { for (real i = yMin+1; i < yMax; ++i) { draw((-1/8,i)--(1/8,i), black+linewidth(1)); } } //Draws the vertical ticks void verticalTicks() { for (real i = xMin+pi/2; i < xMax; i+=pi/2) { draw((i,-1/8)--(i,1/8), black+linewidth(1)); } } horizontalLines(); verticalLines(); horizontalTicks(); verticalTicks(); draw((xMin,0)--(xMax,0),black+linewidth(1.5),EndArrow(5)); draw((0,yMin)--(0,yMax),black+linewidth(1.5),EndArrow(5)); label("$x$",(xMax,0),(2,0)); label("$y$",(0,yMax),(0,2)); pair A[]; A[0] = (pi/2,0); A[1] = (pi,0); A[2] = (0,1); A[3] = (0,0); A[4] = (0,-1); label("$\frac{\pi}{2}$",A[0],(0,-2.5)); label("$\pi$",A[1],(0,-2.5)); label("$1$",A[2],(-2.5,0)); label("$0$",A[3],(-2.5,0)); label("$-1$",A[4],(-2.5,0)); dot((0,1),linewidth(5)); dot((pi/2,0),linewidth(5)); add(legend(),point(E),40E,UnFill);
```

Therefore, the answer is $\boxed{\textbf{(C) }2}.$

*~MRENTHUSIASM (credit given to TheAMCHub)*
## Solution 5 (No Graphing)
For $\sin(a) = \cos(b),$ a and b must be complementary angles, or  a + b = $\frac{\pi}{2}.$ So we have

$$\frac{\pi}{2}(\sin(x) + \cos(x)) = \frac{\pi}{2} \implies \sin(x) + \cos(x) = 1.$$


We know $\sin^2(x) + \cos^2(x) = 1,$ so we can express $\cos(x)$ in terms of $\sin(x)$ and set those expressions equal to each other:


$$\sqrt{1 - \sin^2(x)} = 1 - \sin(x) \implies 1 - \sin^2(x) = (1 - \sin(x))^2 \implies \sin(x) = 1.$$


So now the problem becomes the number of values of x on the interval [0, $\pi$] such that $\sin(x) = 1.$ It's pretty easy to see that x can equal 0 or $\frac{\pi}{2},$ so the answer is $\boxed{\textbf{(C) }2}.$

*~grogg007*
## Video Solution by OmegaLearn (Using Triangle Inequality & Trigonometry)
https://youtu.be/wJxN1YPuyCg

*~pi_is_3.14*
## Video Solution (Quick and Easy)
https://youtu.be/6AWb9cqFblU

*~Education, the Study of Everything*
## See also
