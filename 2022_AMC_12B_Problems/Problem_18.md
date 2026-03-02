# 2022 AMC 12B Problem 18

> This problem is the same as [2022 AMC 10B #19](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_19) and [2022 AMC 12B #18](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_18).
## Problem
Each square in a $5 \times 5$ grid is either filled or empty, and has up to eight adjacent neighboring squares, where neighboring squares share either a side or a corner. The grid is transformed by the following rules:

- Any filled square with two or three filled neighbors remains filled.

- Any empty square with exactly three filled neighbors becomes a filled square.

- All other squares remain empty or become empty.

A sample transformation is shown in the figure below.
<asy>
        import geometry;

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.6cm);
```


        void ds(pair x) {

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(x -- (1,0) + x -- (1,1) + x -- (0,1)+x -- cycle,mediumgray,invisible);
```

        }

        ds((1,1));
        ds((2,1));
        ds((3,1));
        ds((1,3));

        for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,i)--(5,i));
draw((i,0)--(i,5));
```

        }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("Initial", (2.5,-1));
draw((6,2.5)--(8,2.5),Arrow);
```


        ds((10,2));
        ds((11,1));
        ds((11,0));

        for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((9,i)--(14,i));
draw(($i+9,0)--(i+9$,5));
```

        }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("Transformed", (11.5,-1));
```

</asy>
Suppose the $5 \times 5$ grid has a border of empty squares surrounding a $3 \times 3$ subgrid. How many initial configurations will lead to a transformed grid consisting of a single filled square in the center after a single transformation? (Rotations and reflections of the same configuration are considered different.)
<asy>
        import geometry;

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.6cm);
```


        void ds(pair x) {

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(x -- (1,0) + x -- (1,1) + x -- (0,1)+x -- cycle,mediumgray,invisible);
```

        }

        for (int $i = 1$; i < 4; ++ i) {
            for (int $j = 1$; j < 4; ++j) {

> [Asymptote diagram - not rendered in Markdown]

```asy
label("?",(i + 0.5, j + 0.5));
```

            }
        }

        for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,i)--(5,i));
draw((i,0)--(i,5));
```

        }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("Initial", (2.5,-1));
draw((6,2.5)--(8,2.5),Arrow);
```


        ds((11,2));

        for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((9,i)--(14,i));
draw(($i+9,0)--(i+9$,5));
```

        }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("Transformed", (11.5,-1));
```

</asy>
$\textbf{(A)}\ 14 \qquad\textbf{(B)}\ 18 \qquad\textbf{(C)}\ 22 \qquad\textbf{(D)}\ 26 \qquad\textbf{(E)}\ 30$
## Solution
There are two cases for the initial configuration:
<ol style="margin-left: 1.5em;">
  <li>The center square is filled. </li><p>
Exactly two of the eight adjacent neighboring squares of the center are filled. Clearly, the only possibility is that the squares along one diagonal are filled, as shown below:<p>
<asy>
import geometry;

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.6cm);
```


void ds(pair x) {

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(x -- (1,0) + x -- (1,1) + x -- (0,1)+x -- cycle,mediumgray,invisible);
```

}

ds((1,3));
ds((2,2));
ds((3,1));

for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,i)--(5,i));
draw((i,0)--(i,5));
```

    }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$2$ Configurations", (2.5,-1));
```

</asy>
In this case, there are $2$ possible initial configurations. All rotations and reflections are considered.<p>
  <li>The center square is empty.</li><p>
Exactly three of the eight adjacent neighboring squares of the center are filled. The possibilities are shown below:<p>
<asy>
import geometry;

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.6cm);
```


void ds(pair x) {

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(x -- (1,0) + x -- (1,1) + x -- (0,1)+x -- cycle,mediumgray,invisible);
```

}

ds((1,3));
ds((3,3));
ds((1,1));

for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,i)--(5,i));
draw((i,0)--(i,5));
```

    }

ds((10,3));
ds((12,3));
ds((11,1));

for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((9,i)--(14,i));
draw(($i+9,0)--(i+9$,5));
```

    }

ds((19,3));
ds((20,1));
ds((21,2));

for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((18,i)--(23,i));
draw(($i+18,0)--(i+18$,5));
```

    }

ds((28,3));
ds((29,1));
ds((30,1));

for (int $i = 0$; i <= 5; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((27,i)--(32,i));
draw(($i+27,0)--(i+27$,5));
```

    }


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$4$ Configurations", (2.5,-1));
label("$4$ Configurations", (11.5,-1));
label("$4$ Configurations", (20.5,-1));
label("$8$ Configurations", (29.5,-1));
```

</asy>
In this case, there are $4+4+4+8=20$ possible initial configurations. All rotations and reflections are considered.<p>
</ol>
Together, the answer is $\boxed{\textbf{(C)}\ 22}.$

*~mathboy100 ~MRENTHUSIASM*
## Remark
This problem is based off of Conway's Game of Life, a cellular automaton created by British mathematician John Conway in 1970. The game follows the exact same pattern of rules as this problem, but is played on an infinite grid of cells.
## Video Solution by OmegaLearn.org (Using Logic and Casework)
https://youtu.be/UYTiP3u5qE4
## Video Solution
https://youtu.be/CL_xjeRR02U

*~MathProblemSolvingSkills.com*
## Video Solution
https://youtu.be/JVDlHCSPF6k

*~Hayabusa1*
## Video Solution by Interstigation
https://youtu.be/gsaD0wQPVgY

*~Interstigation*
## See Also
