# 2020 AMC 12B Problem 19

> This problem is the same as [2020 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #19](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
Square $ABCD$ in the coordinate plane has vertices at the points $A(1,1), B(-1,1), C(-1,-1),$ and $D(1,-1).$ Consider the following four transformations:

$\quad\bullet\qquadL,$ a rotation of $90^{\circ}$ counterclockwise around the origin;

$\quad\bullet\qquadR,$ a rotation of $90^{\circ}$ clockwise around the origin;

$\quad\bullet\qquadH,$ a reflection across the $x$-axis; and

$\quad\bullet\qquadV,$ a reflection across the $y$-axis.

Each of these transformations maps the squares onto itself, but the positions of the labeled vertices will change. For example, applying $R$ and then $V$ would send the vertex $A$ at $(1,1)$ to (-1,-1)$$ and would send the vertex $B$ at $(-1,1)$ to itself. How many sequences of $20$ transformations chosen from $\{L, R, H, V\}$ will send all of the labeled vertices back to their original positions? (For example, $R, R, V, H$ is one sequence of $4$ transformations that will send the vertices back to their original positions.)

$\textbf{(A)}\ 2^{37} \qquad\textbf{(B)}\ 3\cdot 2^{36} \qquad\textbf{(C)}\ 2^{38} \qquad\textbf{(D)}\ 3\cdot 2^{37} \qquad\textbf{(E)}\ 2^{39}$
## Solution 1
For each transformation:
<ol style="margin-left: 1.5em;">
  <li>Each labeled vertex will move to an adjacent position.</li><p>
  <li>The labeled vertices will maintain the consecutive order $ABCD$ in either direction (clockwise or counterclockwise).</li><p>
  <li>$L$ and $R$ will retain the direction of the labeled vertices, but $H$ and $V$ will alter the direction of the labeled vertices.</li><p>
</ol>
After the $19$th transformation, vertex $A$ will be at either $(1,-1)$ or $(-1,1).$ All possible configurations of the labeled vertices are shown below:
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(7mm);
label("$A$",(1,0));
label("$B$",(1,1));
label("$C$",(0,1));
label("$D$",(0,0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$C$",(5,0));
label("$D$",(5,1));
label("$A$",(4,1));
label("$B$",(4,0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$A$",(9,0));
label("$D$",(9,1));
label("$C$",(8,1));
label("$B$",(8,0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$C$",(13,0));
label("$B$",(13,1));
label("$A$",(12,1));
label("$D$",(12,0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$\textbf{Configuration}$",(-5,0.5));
label("$\textbf{The 20th}$",(-5,-1.5));
label("$\textbf{Transformation}$",(-5,-2.25));
label("$L$",(0.5,-1.875));
label("$R$",(4.5,-1.875));
label("$H$",(8.5,-1.875));
label("$V$",(12.5,-1.875));
```

</asy>
Each sequence of $19$ transformations generates one valid sequence of $20$ transformations. Therefore, the answer is $4^{19}=\boxed{\textbf{(C)}\ 2^{38}}.$

*~MRENTHUSIASM*
## Solution 2
Let $(+)$ denote counterclockwise/starting orientation and $(-)$ denote clockwise orientation.
Let $1,2,3,$ and $4$ denote which quadrant $A$ is in.

Realize that from any odd quadrant and any orientation, the $4$ transformations result in some permutation of $(2+, 2-, 4+, 4-).$

The same goes that from any even quadrant and any orientation, the $4$ transformations result in some permutation of $(1+, 1-, 3+, 3-).$

We start our first $19$ moves by doing whatever we want, $4$ choices each time. Since $19$ is odd, we must end up on an even quadrant.

As said above, we know that exactly one of the four transformations will give us $(1+),$ and we must use that transformation.

Thus, the answer is $4^{19}=\boxed{\textbf{(C)}\ 2^{38}}.$
## Solution 3
Notice that any **pair** of transformations either swaps the $x$ and $y$-coordinates, negates the $x$ and $y$-coordinates, swaps and negates the $x$ and $y$-coordinates, or leaves the original unchanged. Furthermore, notice that for each of these results, if we apply another pair of transformations, one of these results will happen again, and with equal probability. Therefore, no matter what state we are in after we apply the first $9$ pairs of transformations, there is a $\frac{1}{4}$ chance the last pair of transformations will return the figure to its original position. Therefore, the answer is $\frac{4^{20}}{8} = 2^{37} = \boxed{\textbf{(A)}\ 2^{37}}.$
## Solution 4
The total number of sequences is $4^{20}=2^{40}.$

Note that there can only be an even number of reflections since they result in the same anti-clockwise orientation of the vertices $A,B,C,D.$ Therefore, the probability of having the same anti-clockwise orientation with the original arrangement after the transformation is $\frac{1}{2}.$

Next, the even number of reflections means that there must be an even number of rotations since their sum is even. Even rotations result in only the original position or a $180^{\circ}$ rotation of it.

Since rotation $R$ and rotation $L$ cancel each other out, the difference between the numbers of them define the final position. The probability of the transformation returning the vertices to the original position, given that there are even number of rotations, is equivalent to the probability that

<center>$|n(R)-n(L)|\equiv0\pmod{4}$ when $|n(H)-n(V)|\equiv0\pmod{4}$</center>

<center>or</center>

<center>$|n(R)-n(L)|\equiv2\pmod{4}$ when $|n(H)-n(V)|\equiv2\pmod{4}$</center>

which is again, $\frac{1}{2}.$

Therefore, the answer is $2^{40}\cdot\frac{1}{2}\cdot\frac{1}{2}=\boxed{\textbf{(C)}\ 2^{38}}.$

*~joshuamh111*

*~Edits by Eric X*
## Solution 5 (Group Theory)
This problem is a [https://en.wikipedia.org/wiki/Dihedral_group Dihedral Group] problem, $D_4$, in [https://en.wikipedia.org/wiki/Group_theory Group Theory].

The transformation has associativity, for $x, y, z \in 	\{ L, R, H, V \}$, (x \circ y)$ \circ z = x \circ (y \circ z)$.

Let $I$ be the initial state of the square $A(1,1), B(-1,1), C(-1,-1),$ and $D(1,-1)$.


$$\begin{align}

$$
R \circ L = L \circ R = V \circ V = H \circ H = I\\
V \circ H = R \circ R = H \circ V = L \circ L\\
H \circ R = L \circ H = V \circ L = R \circ V\\
V \circ R = L \circ V = H \circ L = R \circ H
$$

$\end{align}$$$


It's not hard to see that after a series of transformations from initial state $I$ to initial state $I$, the number of transformations must be even. Denote $f(2n)$ be the number of sequences of $2n$ transformations from initial state $I$ to initial state $I$. We are going to prove $f(2n) = 4^{2n-1}$.

For each transformation composite operator, there are $4$ replacements.

For example, when $n = 2$:


$$R \circ R \circ R \circ R = (R \circ R) \circ R \circ R = I.$$


From $(2)$, $R \circ R = V \circ H = H \circ V = L \circ L$, so $R \circ R$ can be replaced with $V \circ H$, $H \circ V$, $L \circ L$ without changing the result. Suppose we choose $V \circ H$, then

$$(R \circ R) \circ R \circ R = (V \circ H) \circ R \circ R = V \circ (H \circ R) \circ R.$$


From $(3)$, $H \circ R = L \circ H = V \circ L = R \circ V$, so $H \circ R$ can be replaced with $L \circ H$, $V \circ L$, $R \circ V$ without changing the result. Suppose we choose $R \circ V$, then

$$V \circ (H \circ R) \circ R = V \circ (R \circ V) \circ R = V \circ R \circ (V \circ R).$$


From $(4)$, $V \circ R = L \circ V = H \circ L = R \circ H$, so $V \circ R$ can be replaced with $L \circ V$, $H \circ L$, $R \circ H$ without changing the result. Suppose we choose $H \circ L$, then

$$V \circ R \circ (V \circ R) =V \circ R \circ (H \circ L) = V \circ R \circ H \circ L = I.$$


So, we have $f(4) = 4^{4-1}$:


$$\underbrace{R \circ R \circ R \circ R \circ \dots R \circ R \circ R}_{2n}.$$


With $2nR$ transformations, it will go from initial state to initial state. There are $2n-1$ transformation composite operators $\circ$ between the transformations, and each pair of transformations surrounding the transformations composite operator $\circ$ have $4$ options. So, we have $f(2n) = 4^{2n-1}$, from which $f(20) = 4^{20-1} = \boxed{\textbf{(C)}\ 2^{38}}$.

<u><b>Side Note</b></u>

Equations $(2)$, $(3)$, $(4)$ are equivalent. Here I will prove that $(2)$ is equivalent to $(3)$.

From $(1)$, $R \circ L = V \circ V$. We have


$$H \circ (R \circ L) = H \circ (V \circ V) = (H \circ V) \circ V.$$


From $(2)$, $H \circ V = V \circ H = L \circ L$. We have


$$(H \circ V) \circ V = (V \circ H) \circ V = V \circ (H \circ V) = V \circ (L \circ L).$$


So,

$$(H \circ R) \circ L = H \circ (R \circ L) = V \circ (L \circ L) = (V \circ L) \circ L.$$


It follows that $H \circ R = V \circ L$, which is $(3)$.

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 6 (Quick)
The number of possible ways to orient a square using this method $20$ times would be $4^{20}$, as for each of the transformations we can only use the four transformations $L$, $V$, $H$, or $R$.

After 20 transformations, there are only 4 possible outcomes, as parity prohibits the other 4 outcomes. By symmetry, all $4$ of these possibilities are equally likely. Thus, our answer is $\frac{4^{20}}{4} = 4^{19}=\boxed{\textbf{(C)}\ 2^{38}}.$

*~cdm ~QuickCat (clarified fakesolve element)*
## Solution 7 (Generating Functions)
Let $x$ represent rotating $\overline{AC}\circ$ counterclockwise about the origin and let $y$ represent rotating $\overline{BD}\circ$ counterclockwise about the origin. Then, note that the transformations $L, V, H,$ and $R$ can be encoded by $xy, \tfrac{1}{xy}, \tfrac{y}{x},$ and $\tfrac{x}{y},$ respectively. Thus, we wish to compute the sum of the coefficients of the terms of the form $cx^{4a}y^{4b}$ for $a, b, c \ge 0$ in the polynomial

$$(xy+\tfrac{1}{xy}+\tfrac{y}{x}+\tfrac{x}{y})^{20}.$$

 We can factor the polynomial to get

$$((x+\tfrac{1}{x})(y+\tfrac{1}{y}))^{20} = (x+\tfrac{1}{x})^{20}(y+\tfrac{1}{y})^{20}.$$

 We can multiply the polynomial by $x^{20}y^{20}$ and it wouldn't affect the sum of the coefficients of the terms of the form $cx^{4a}y^{4b},$ so we can now work with

$$(x^2+1)^{20}(y^2+1)^{20}.$$

 Now, it is very evident that we will get a term of the form $cx^{4a}y^{4b}$ exactly when the first part of the polynomial contributes an even number of $x^2$'s and the second part of the polynomial contributes an even number of $y^2$'s, so the answer is

$$
\begin{align*}
\left(\binom{20}{0} + \binom{20}{2} + \ldots + \binom{20}{20}\right)\left(\binom{20}{0} + \binom{20}{2} + \ldots + \binom{20}{20}\right) &= 2^{19} \cdot 2^{19} \\
&= \boxed{\text{(C)} \ 2^{38}}.
\end{align*}
$$

$\square$

*~lpieleanu*
## Video Solutions
### Video Solution 1
https://www.youtube.com/watch?v=XZs9DHg6cx0

*~MathEx*
### Video Solution 2 by The Beauty of Math
https://youtu.be/Bl2kn9oVxQ8?t=348

*~Icematrix*
## See Also
