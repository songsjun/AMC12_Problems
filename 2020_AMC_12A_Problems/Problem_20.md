# 2020 AMC 12A Problem 20

> This problem is the same as [2020 AMC 12A #20](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
Let $T$ be the triangle in the coordinate plane with vertices $(0,0), (4,0),$ and $(0,3).$ Consider the following five isometries (rigid transformations) of the plane: rotations of $90^{\circ}, 180^{\circ},$ and $270^{\circ}$ counterclockwise around the origin, reflection across the $x$-axis, and reflection across the $y$-axis. How many of the $125$ sequences of three of these transformations (not necessarily distinct) will return $T$ to its original position? (For example, a $180^{\circ}$ rotation, followed by a reflection across the $x$-axis, followed by a reflection across the $y$-axis will return $T$ to its original position, but a $90^{\circ}$ rotation, followed by a reflection across the $x$-axis, followed by another reflection across the $x$-axis will not return $T$ to its original position.)

$\textbf{(A) } 12 \qquad \textbf{(B) } 15 \qquad \textbf{(C) } 17 \qquad \textbf{(D) } 20 \qquad \textbf{(E) } 25$
## Solution 1 (Simplest)
Label each rotation $A, B, C, D$, and $E$ respectively.

One can notice that any rotation on any figure is formed by the transformation on its vertices. Therefore, instead of thinking about the entire triangle, just think of the point $(x, y)$.

We proceed with casework on the $\circ$ rotation (B)

Case A: We don't consider $B$ ($\circ$ degrees)

We have $A, C, D$, and $E$.
Notice that we cannot have two reflections with one another as that will finish the sequence in two moves, not three.

We also may not have two rotations, as it will cause the sequence to end in two moves as well.

So we have one rotation and one reflection, but now we have a dilemma. We must choose either another rotation or another reflection.

However, we deduced this is impossible, as it will not take the coordinate back to its original position. Therefore, there are 0 cases that work here.

Case B: We consider the $\circ$ degree

We first look at reflections. If we have two reflections of one kind D or E, we see that the sequence will finish in 2 rounds. Therefore. we must have one reflection D, one reflection E, and one $\circ$ rotation. This means we have a transformation set $\{B, D, E\}$. The elements of this set can be swapped in $3! = 6$ ways.

We now look at rotations. If we have two rotations of A, that is essentially $\circ + 90^\circ = 180^\circ$ of rotation, and therefore mixed in with a $\circ$ rotation guarantees the same coordinate $(x, y)$. So, we have a transformation set $\{A, A, B\}$, which can be arranged in $\frac{3!}{2!} = 3$ ways. What about $C$? We can just see that $C$ is just a rotation $\circ$ clockwise, so if we apply 2 of these, we again get $\circ + 90^\circ = 180^\circ$ of rotation, giving us enough room for transformation B. Then, our set is $\{C, C, B\}$, which can be again arranged in $\frac{3!}{2!} = 3$ ways.

Do any other cases exist? Well, if we have two rotations, then it is impossible, as the rotations negate one another into a $\circ$ rotation in two moves.
More importantly, we also see that if we have a mix between a rotation and a reflection, we can see that one will swap the places of $x$ and $y$ (x, y)$ \rightarrow (-y, x)$ for instance, and the only other way to change that is another rotation that is not $B$, which we already deemed was impossible
We already concluded in case A that we cannot have $A, C,$ and then either $D$ or $E$, therefore, we can only have $B$, but either through inspection or seeing that $B$ negates the values of $x$ and $y$ while a rotation of A and C brings them back to normal, therefore, this can also not work.

Thus the total number of cases is $3+3 = 6$

We have examined all the cases, and therefore our answer is $6+6 =\boxed{\textbf{(A)}  12}$

*~Pinotation*
## Solution 2
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm);
Label f;
f.p=fontsize(6);
```

xaxis(-6,6,Ticks(f, 2.0));
yaxis(-6,6,Ticks(f, 2.0));


> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(origin--(4,0)--(0,3)--cycle, gray, black+linewidth(1));
```

</asy>

First, any combination of motions we can make must reflect $T$ an even number of times. This is because every time we reflect $T$, it changes orientation. Once $T$ has been flipped once, no combination of rotations will put it back in place because it is the mirror image; however, flipping it again changes it back to the original orientation. Since we are only allowed $3$ transformations and an even number of them must be reflections, we either reflect $T0$ times or $2$ times.


Case 1: $0$ reflections on $T$.


In this case, we must use $3$ rotations to return $T$ to its original position. Notice that our set of rotations, $\{\circ,180^\circ,270^\circ\}$, contains every multiple of $\circ$ except for $\circ$. We can start with any two rotations $a,b$ in $\{\circ,180^\circ,270^\circ\}$ and there must be exactly one $c \equiv -a - b \pmod{360^\circ}$ such that we can use the three rotations $(a,b,c)$ which ensures that $a + b + c \equiv 0^\circ \pmod{360^\circ}$. That way, the composition of rotations $a,b,c$ yields a full rotation. For example, if $a = b = \circ$, then $c \equiv -90^\circ - 90^\circ = -180^\circ \pmod{360^\circ}$, so $c = \circ$ and the rotations $(\circ,90^\circ,180^\circ)$ yields a full rotation.

The only case in which this fails is when $c$ would have to equal $\circ$. This happens when $(a,b)$ is already a full rotation, namely, $(a,b) = (\circ,270^\circ),(180^\circ,180^\circ),$ or $(\circ,90^\circ)$. However, we can simply subtract these three cases from the total. Selecting $(a,b)$ from $\{\circ,180^\circ,270^\circ\}$ yields $3 \cdot 3 = 9$ choices, and with $3$ that fail, we are left with $6$ combinations for case $1$.


Case 2: $2$ reflections on $T$.


In this case, we first eliminate the possibility of having two of the same reflection. Since two reflections across the x-axis maps $T$ back to itself, inserting a rotation before, between, or after these two reflections would change $T$'s final location, meaning that any combination involving two reflections across the x-axis would not map $T$ back to itself. The same applies to two reflections across the y-axis.

Therefore, we must use one reflection about the x-axis, one reflection about the y-axis, and one rotation. Since a reflection about the x-axis changes the sign of the y component, a reflection about the y-axis changes the sign of the x component, and a $\circ$ rotation changes both signs, these three transformation composed (in any order) will suffice. It is therefore only a question of arranging the three, giving us $3! = 6$ combinations for case 2.

Combining both cases we get $\boxed{\textbf{(A)}  12}$.
## Solution 3 (Rewording of Solution 2)
As in the previous solution, note that we must have either $0$ or $2$ reflections because of orientation since reflection changes orientation that is impossible to fix by rotation. We also know we can't have the same reflection twice, since that would give a net of no change and would require an identity rotation.

Suppose there are no reflections. Denote $90^{\circ}$ as $1$, $180^{\circ}$ as $2$, and $270^{\circ}$ as $3$, just for simplification purposes. We want a combination of $3$ of these that will sum to either $4$ or $8$ ($0$ and $12$ are impossible since the minimum is $3$ and the max is $9$). $4$ can be achieved with any permutation of $(1-1-2)$ and $8$ can be achieved with any permutation of $(2-3-3)$. This case can be done in $3+3=6$ ways.

Suppose there are two reflections. As noted already, they must be different, and as a result will take the triangle to the opposite side of the origin if we don't do any rotation. We have $1$ rotation left that we can do though, and the only one that will return to the original position is $2$, which is $180^{\circ}$ AKA reflection across origin. Therefore, since all $3$ transformations are distinct. The three transformations can be applied anywhere since they are commutative (think quadrants). This gives $6$ ways.

$6+6=\boxed{\textbf{(A)}  12}$.
## Solution 4 (Group Theory)
Define $s$ as a reflection, and $r$ as a $90^{\circ}$ counterclockwise rotation. Thus, $r^4=s^2=e$, and the five transformations can be represented as ${r, r^2, r^3, r^2s, s}$, and $rs=sr^{-1}$.

Now either $s$ doesn't appear at all or appears twice. For the former case, it's easy to see that only $r, r, r^2$ and $r^2, r^3, r^3$ will work. Both can be permuted in $3$ ways, giving $6$ ways in total.

For the latter case, note that $s$ can't appear twice, neither does $r^2s$, else we need to get $e$ from ${r, r^2, r^3}$, which is not possible. So $r^2s$ and $s$ must appear once each. The last transformation must be $r^2$. A quick check shows that ${r^2, r^2s, s}$ is permutable, since $r^2s=sr^{-2}=sr^2$ (since $r^4=e$). This gives $6$ ways.

Thus the answer is $\boxed{\textbf{(A)} 12}$.

*~Xrider100*
## Video Solution by STEM Station(Quick and Easy to Understand)
https://youtu.be/t38EvyrglbQ
## Video Solution by Education, The Study of Everything
https://youtu.be/SBhkM2frTUA
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2020amc10a/513
## Video Solution by MathEx
https://www.youtube.com/watch?v=iXwvTmFvo0c
## See Also
